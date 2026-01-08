# Automatic Flower Watering System

This Arduino project automatically waters your flowers when the soil becomes too dry.

## Components Needed

- Arduino Uno (or compatible board)
- Soil moisture sensor
- Water pump (5V-12V)
- Relay module (to control the pump)
- LED (built-in on pin 13)
- Jumper wires
- Breadboard
- Power supply for the pump (if separate from Arduino)

## Circuit Connections

- Moisture Sensor:
  - VCC to 5V
  - GND to GND
  - OUT to Arduino pin A0

- Water Pump:
  - Controlled through a relay module
  - Relay IN to Arduino pin 7
  - Relay VCC to 5V
  - Relay GND to GND

- LED:
  - Built-in LED on pin 13 (lights up when watering)

## How It Works

1. The soil moisture sensor continuously monitors the moisture level in the soil
2. When the moisture level drops below the threshold (default 300), the system activates the water pump
3. The built-in LED lights up to indicate that watering is in progress
4. When the soil reaches adequate moisture levels, the pump turns off
5. All readings are sent to the Serial Monitor for observation

## Customization

You can adjust the `moistureThreshold` value in the code to change when the system starts watering:
- Lower values (around 200-300) mean the system waters when soil is drier
- Higher values (around 400-500) mean the system waters more frequently

## Installation

1. Connect all components according to the circuit connections above
2. Upload the code to your Arduino board
3. Open the Serial Monitor to view moisture readings
4. Insert the moisture sensor into your plant's soil
5. Place the water pump tube in a water container
6. Position the pump outlet near your plant

## Troubleshooting

- If the pump doesn't activate, check all connections and ensure the relay is properly configured
- If the system waters too frequently or not enough, adjust the moistureThreshold value
- Ensure the pump has adequate power supply