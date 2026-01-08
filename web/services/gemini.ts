import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../lib/db.js';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface HealthAnalysis {
    healthScore: number;
    analysis: string;
    issues: string[];
    recommendations: string[];
    severity: 'normal' | 'warning' | 'critical';
}

export async function analyzeHealthFromCamera(cameraUrl: string): Promise<HealthAnalysis> {
    try {
        let analysis: HealthAnalysis;

        if (cameraUrl === 'SIMULATION') {
            // Mock Analysis for Testing
            console.log('Running simulated health check...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Fake delay

            analysis = {
                healthScore: 95,
                analysis: "Plant appears vibrant and healthy with strong turgor pressure. Leaf color is a deep, healthy green indicating optimal nitrogen levels. No signs of pests or bacterial infection.",
                issues: [],
                recommendations: ["Continue current nutrient schedule", "Monitor pH levels"],
                severity: "normal"
            };
        } else {
            // Capture image from camera
            const imageResponse = await axios.get(cameraUrl, { responseType: 'arraybuffer' });
            const imageBase64 = Buffer.from(imageResponse.data).toString('base64');

            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

            const prompt = `Analyze this hydroponic plant image and provide a detailed health assessment.

Focus on:
1. Leaf color and texture (yellowing, browning, spots, discoloration)
2. Growth patterns (stunted growth, wilting, drooping)
3. Nutrient deficiencies (nitrogen, phosphorus, potassium, calcium, magnesium)
4. Pest or disease signs (insects, mold, fungus, bacterial infections)
5. Overall plant vigor and health

Provide your response in this exact JSON format:
{
  "healthScore": <0-100>,
  "analysis": "<detailed analysis>",
  "issues": ["<issue 1>", "<issue 2>"],
  "recommendations": ["<action 1>", "<action 2>"],
  "severity": "<normal|warning|critical>"
}`;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: 'image/jpeg'
                    }
                }
            ]);

            const response = await result.response;
            const text = response.text();

            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid response format from Gemini');
            }

            analysis = JSON.parse(jsonMatch[0]);
        }

        // Save to database
        await prisma.healthCheck.create({
            data: {
                imageUrl: cameraUrl,
                analysis: analysis.analysis,
                healthScore: analysis.healthScore,
                actions: JSON.stringify(analysis.recommendations),
                severity: analysis.severity
            }
        });

        // Create system log
        await prisma.systemLog.create({
            data: {
                level: analysis.severity === 'critical' ? 'CRITICAL' : analysis.severity === 'warning' ? 'WARNING' : 'INFO',
                message: `AI Health Check: Score ${analysis.healthScore}/100 - ${analysis.severity.toUpperCase()}`,
                source: 'ai'
            }
        });

        // If critical, create emergency action log
        if (analysis.severity === 'critical') {
            await prisma.autopilotAction.create({
                data: {
                    action: 'EMERGENCY_INTERVENTION',
                    parameters: JSON.stringify({
                        reason: analysis.issues,
                        actions: analysis.recommendations
                    }),
                    success: false // Requires manual intervention
                }
            });
        }

        return analysis;
    } catch (error) {
        console.error('Health analysis failed:', error);
        throw error;
    }
}

export async function scheduleDailyHealthCheck() {
    try {
        const config = await prisma.eSP32Config.findFirst();
        if (!config || !config.cameraUrl) {
            console.log('No camera URL configured');
            return;
        }

        console.log('Running daily health check...');
        const analysis = await analyzeHealthFromCamera(config.cameraUrl);
        console.log('Health check complete:', analysis);

        return analysis;
    } catch (error) {
        console.error('Daily health check failed:', error);
    }
}

// Schedule daily health check at 12:00 PM
export function startHealthCheckScheduler() {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(12, 0, 0, 0);

    if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilFirst = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
        scheduleDailyHealthCheck();
        // Then run every 24 hours
        setInterval(scheduleDailyHealthCheck, 24 * 60 * 60 * 1000);
    }, timeUntilFirst);

    console.log(`Health check scheduler started. Next check at ${scheduledTime.toLocaleString()}`);
}
