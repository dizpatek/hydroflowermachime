#!/usr/bin/env python3
"""
Simulation of the Automatic Flower Watering System
This script simulates how the Arduino system would behave
"""

import time
import random

class FlowerWateringSystem:
    def __init__(self):
        # System parameters
        self.moisture_threshold = 300
        self.current_moisture = 500  # Start with moist soil
        self.is_watering = False
        self.water_level = 100  # Percentage
        
    def read_moisture_sensor(self):
        """Simulate reading from moisture sensor"""
        # Add some randomness to simulate real-world conditions
        variation = random.randint(-20, 20)
        self.current_moisture = max(0, min(1023, self.current_moisture + variation))
        return self.current_moisture
    
    def start_watering(self):
        """Turn on the water pump"""
        if not self.is_watering:
            print("Soil is dry! Starting watering...")
            self.is_watering = True
            return True
        return False
    
    def stop_watering(self):
        """Turn off the water pump"""
        if self.is_watering:
            print("Soil moisture is sufficient. Stopping watering.")
            self.is_watering = False
            return True
        return False
    
    def update_moisture(self):
        """Update moisture based on watering status"""
        if self.is_watering:
            # Increase moisture when watering (up to a max)
            self.current_moisture = min(1023, self.current_moisture + 50)
            # Decrease water level
            self.water_level = max(0, self.water_level - 2)
        else:
            # Gradually decrease moisture (evaporation, plant uptake)
            self.current_moisture = max(0, self.current_moisture - 10)
    
    def run_cycle(self):
        """Run one cycle of the watering system"""
        # Read moisture sensor
        moisture = self.read_moisture_sensor()
        
        print(f"Soil Moisture: {moisture}")
        
        # Check if we need to start or stop watering
        if moisture < self.moisture_threshold and not self.is_watering:
            self.start_watering()
        elif moisture >= self.moisture_threshold and self.is_watering:
            self.stop_watering()
        
        # Update moisture based on watering status
        self.update_moisture()
        
        # Show system status
        watering_status = "ON" if self.is_watering else "OFF"
        print(f"Water Pump: {watering_status} | Water Level: {self.water_level}%")
        print("-" * 40)
        
        return True

def main():
    print("Automatic Flower Watering System - Simulation")
    print("=" * 50)
    print("This simulation demonstrates how the Arduino system would behave")
    print()
    
    # Create system instance
    system = FlowerWateringSystem()
    
    # Run simulation for 20 cycles
    for cycle in range(20):
        print(f"Cycle #{cycle + 1}")
        system.run_cycle()
        
        # Wait 2 seconds between cycles (simulating the delay(2000))
        time.sleep(2)
        
        # For demo purposes, let's make it more interesting by manually changing conditions
        if cycle == 5:
            print("** Simulating dry condition **")
            system.current_moisture = 200
        elif cycle == 12:
            print("** Simulating sufficient moisture **")
            system.current_moisture = 400
    
    print("Simulation completed!")

if __name__ == "__main__":
    main()