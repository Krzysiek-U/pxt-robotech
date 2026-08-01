// ==========================================
// ENUMERATIONS (TYPES)
// ==========================================

enum RexPinMode {
    //% block="digital out"
    DigitalOut,
    //% block="digital in"
    DigitalIn,
    //% block="PWM"
    Pwm,
    //% block="analog (ADC)"
    AnalogIn
}

enum LedState {
    //% block="turn on"
    On,
    //% block="turn off"
    Off
}

enum MotorNumber {
    //% block="M1"
    M1 = 1,
    //% block="M2"
    M2 = 2,
    //% block="M3"
    M3 = 3,
    //% block="M4"
    M4 = 4
}

enum RexPin {
    //% block="S0"
    S0 = 0,
    //% block="S1"
    S1 = 1,
    //% block="S2"
    S2 = 2,
    //% block="S3"
    S3 = 3
}

// ==========================================
// HELPER FUNCTIONS & INTERNAL BUFFER STATE
// ==========================================

function getParam(frame: string, key: string): string {
    let keyToken = key + ":"
    let keyPos = frame.indexOf(keyToken)
    if (keyPos == -1) return ""

    let valueStart = keyPos + keyToken.length
    let valueEnd = frame.indexOf(";", valueStart)
    if (valueEnd == -1) {
        let length = frame.length - valueStart
        return frame.substr(valueStart, length).trim()
    }

    let chunkLength = valueEnd - valueStart
    return frame.substr(valueStart, chunkLength).trim()
}

namespace robotechREX_Internal {
    export let temp1Wire = 0
    export let adcValues = [0, 0, 0, 0]
    export let faceDetected = false
    export let faceX = 0
    export let faceY = 0

    // SINGLE, SHARED UART BACKGROUND LOOP
    control.inBackground(function () {
        serial.redirect(SerialPin.P1, SerialPin.P0, BaudRate.BaudRate9600)

        while (true) {
            let frame = serial.readLine().trim()
            if (frame.length == 0) {
                basic.pause(1)
                continue
            }

            // Handle frames addressed to micro:bit
            if (frame.indexOf("to:mb;") == 0) {
                let res = getParam(frame, "res")

                if (res == "1w") {
                    let tempStr = getParam(frame, "temp")
                    if (tempStr != "") temp1Wire = parseInt(tempStr)
                }
                else if (res == "adc") {
                    let pinStr = getParam(frame, "pin")
                    let valStr = getParam(frame, "val")
                    if (pinStr != "" && valStr != "") {
                        let pinNum = parseInt(pinStr)
                        let value = parseInt(valStr)
                        if (pinNum >= 0 && pinNum <= 3) adcValues[pinNum] = value
                    }
                }
                else if (res == "face_detect") {
                    let val = getParam(frame, "val")
                    if (val == "true") {
                        faceDetected = true
                        let xStr = getParam(frame, "x")
                        let yStr = getParam(frame, "y")
                        faceX = (xStr != "") ? parseInt(xStr) : 0
                        faceY = (yStr != "") ? parseInt(yStr) : 0
                    } else {
                        faceDetected = false
                        faceX = 0
                        faceY = 0
                    }
                }
            }
            basic.pause(1)
        }
    })
}

// ==========================================
// BLOCKS: ROBOTECH REX
// ==========================================

//% color="#4361ee" icon="\uf2db" block="Robotech REX"
namespace robotechREX {

    //% block="REX: set step S0:%s0° S1:%s1° S2:%s2° S3:%s3° duration %duration ms"
    //% s0.min=0 s0.max=180 s1.min=0 s1.max=180 s2.min=0 s2.max=180 s3.min=0 s3.max=180 duration.min=50 duration.max=3000
    //% s0.defl=90 s1.defl=90 s2.defl=90 s3.defl=90 duration.defl=500
    //% weight=100
    export function setGroupStep(s0: number, s1: number, s2: number, s3: number, duration: number): void {
        serial.writeLine("to:board;cmd:move;s0:" + s0 + ";s1:" + s1 + ";s2:" + s2 + ";s3:" + s3 + ";time:" + duration + ";")
    }

    //% block="REX: configure pin %pin as %mode"
    //% weight=95
    export function configureUniversalPin(pin: RexPin, mode: RexPinMode): void {
        let m = "out";
        if (mode == RexPinMode.DigitalIn) m = "in";
        if (mode == RexPinMode.Pwm) m = "pwm";
        if (mode == RexPinMode.AnalogIn) m = "adc";
        serial.writeLine("to:board;cmd:pin-mode;pin:" + pin + ";mode:" + m + ";")
    }

    //% block="REX: write on pin %pin value %value"
    //% value.min=0 value.max=1023 value.defl=512
    //% weight=90
    export function writePinValue(pin: RexPin, value: number): void {
        serial.writeLine("to:board;cmd:pin-write;pin:" + pin + ";val:" + value + ";")
    }

    //% block="REX: measure analog pin %pin"
    //% weight=85
    export function measureADC(pin: RexPin): void {
        serial.writeLine("to:board;cmd:adc-read;pin:" + pin + ";")
    }

    //% block="REX: read analog value from pin %pin"
    //% weight=84
    export function getAdcValue(pin: RexPin): number {
        return robotechREX_Internal.adcValues[pin];
    }

    //% block="REX: set motor %motor speed %speed"
    //% speed.min=-100 speed.max=100 speed.defl=0
    //% weight=75
    export function controlMotor(motor: MotorNumber, speed: number): void {
        serial.writeLine("to:board;cmd:motor;num:" + motor + ";speed:" + speed + ";")
    }

    //% block="REX: set WS LED %index color R:%r G:%g B:%b"
    //% index.min=0 index.max=3 index.defl=0
    //% r.min=0 r.max=255 r.defl=255
    //% g.min=0 g.max=255 g.defl=0
    //% b.min=0 b.max=255 b.defl=0
    //% weight=70
    export function setWsLed(index: number, r: number, g: number, b: number): void {
        serial.writeLine("to:board;cmd:rgb;index:" + index + ";r:" + r + ";g:" + g + ";b:" + b + ";")
    }

    //% block="REX: request 1-Wire read"
    //% weight=65
    export function request1Wire(): void {
        serial.writeLine("to:board;cmd:1w-read;")
    }

    //% block="REX: 1-Wire temperature (°C)"
    //% weight=64
    export function get1WireTemp(): number {
        return robotechREX_Internal.temp1Wire;
    }
}

// ==========================================
// BLOCKS: ROBOTECH AI
// ==========================================

//% color="#008080" icon="\uf030" block="Robotech AI"
namespace robotechAI {

    //% block="AI: is face detected?"
    //% weight=100
    export function isFaceDetected(): boolean {
        return robotechREX_Internal.faceDetected;
    }

    //% block="AI: face X position"
    //% weight=95
    export function getFaceX(): number {
        return robotechREX_Internal.faceX;
    }

    //% block="AI: face Y position"
    //% weight=90
    export function getFaceY(): number {
        return robotechREX_Internal.faceY;
    }

    //% block="AI: save current image as BACKGROUND"
    //% weight=85
    export function saveBackground(): void {
        serial.writeLine("to:ai;cmd:snap_bg;")
    }

    //% block="AI: save current image as OBJECT"
    //% weight=80
    export function saveObject(): void {
        serial.writeLine("to:ai;cmd:snap_obj;")
    }

    //% block="AI: turn on AP network %ssid password %password"
    //% weight=75
    export function turnOnAP(ssid: string, password: string): void {
        serial.writeLine("to:ai;cmd:ap_ON;ssid:" + ssid + ";pass:" + password + ";")
    }

    //% block="AI: turn off AP"
    //% weight=70
    export function turnOffAP(): void {
        serial.writeLine("to:ai;cmd:ap_OFF;")
    }

    //% block="AI: face detection %state"
    //% state.shadow="toggleOnOff"
    //% weight=65
    export function setFaceDetection(state: boolean): void {
        let s = state ? "ON" : "OFF";
        serial.writeLine("to:ai;cmd:face_detect_" + s + ";")
    }

    //% block="AI: camera power %state"
    //% state.shadow="toggleOnOff"
    //% weight=60
    export function setCameraPower(state: boolean): void {
        let s = state ? "on" : "off";
        serial.writeLine("to:ai;cmd:camera;status:" + s + ";")
    }
}
