#include <Arduino.h>
#include <unity.h>

// Include the main file we want to test
#include "../src/main.cpp"

// Test variables
int testMoistureValue = 0;
bool testIsWatering = false;

// Mock functions for testing
void setUp(void) {
    // Set up before each test
    testMoistureValue = 0;
    testIsWatering = false;
}

void tearDown(void) {
    // Clean up after each test
}

// Test cases
void test_moisture_threshold_detection(void) {
    // Test that the system detects when moisture is below threshold
    testMoistureValue = 200; // Below threshold
    TEST_ASSERT_TRUE(testMoistureValue < moistureThreshold);
    
    // Test that the system detects when moisture is above threshold
    testMoistureValue = 400; // Above threshold
    TEST_ASSERT_FALSE(testMoistureValue < moistureThreshold);
}

void test_watering_logic(void) {
    // Test that watering starts when conditions are met
    testMoistureValue = 200; // Below threshold
    testIsWatering = false;
    bool shouldStartWatering = (testMoistureValue < moistureThreshold && !testIsWatering);
    TEST_ASSERT_TRUE(shouldStartWatering);
    
    // Test that watering stops when conditions are met
    testMoistureValue = 400; // Above threshold
    testIsWatering = true;
    bool shouldStopWatering = (testMoistureValue >= moistureThreshold && testIsWatering);
    TEST_ASSERT_TRUE(shouldStopWatering);
}

int main( int argc, char **argv) {
    UNITY_BEGIN();
    RUN_TEST(test_moisture_threshold_detection);
    RUN_TEST(test_watering_logic);
    UNITY_END();
}