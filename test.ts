/**
 * robotechREX and robotechAI Extension Tests
 * 
 * This code runs on the micro:bit to verify UART communication 
 * with the REX mainboard and the AI camera module.
 */

input.onButtonPressed(Button.A, function () {
    robotechAI.setFaceDetection(true)
})

input.onButtonPressed(Button.B, function () {
    robotechAI.setFaceDetection(false)
})

let y = 0
let x = 0
let adc = 0
let temp = 0

// 1. Initialization and pin configuration test
basic.showIcon(IconNames.Heart)
robotechREX.configureUniversalPin(RexPin.S0, RexPinMode.DigitalOut)
robotechREX.configureUniversalPin(RexPin.S1, RexPinMode.DigitalIn)
robotechAI.turnOnAP("robotech-AI", "123456789")

// 2. Main background testing loop
basic.forever(function () {
    // Test motor and group servo step movements
    robotechREX.controlMotor(MotorNumber.M1, 50)
    robotechREX.setGroupStep(90, 90, 90, 90, 500)
    basic.pause(1000)

    robotechREX.controlMotor(MotorNumber.M1, -50)
    robotechREX.setGroupStep(180, 0, 180, 0, 500)
    basic.pause(1000)

    // Stop the motor
    robotechREX.controlMotor(MotorNumber.M1, 0)

    // Test WS2812B RGB LEDs
    // Red color
    robotechREX.setWsLed(0, 255, 0, 0)
    basic.pause(500)
    
    // Green color
    robotechREX.setWsLed(0, 0, 255, 0)
    basic.pause(500)

    // Request hardware sensor readings from REX board
    robotechREX.request1Wire()
    robotechREX.measureADC(RexPin.S1)

    // Fetch values for diagnostics
    temp = robotechREX.get1WireTemp()
    adc = robotechREX.getAdcValue(RexPin.S1)

    if (temp > 0) {
        // Display temperature string if sensor responds
        basic.showString("T:" + temp)
    }

    // Test Robotech AI module features (Face Tracking)
    if (robotechAI.isFaceDetected()) {
        basic.showIcon(IconNames.Happy)
        x = robotechAI.getFaceX()
        y = robotechAI.getFaceY()
    } else {
        basic.showIcon(IconNames.Asleep)
    }

    basic.pause(2000)
})
