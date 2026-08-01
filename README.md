# Robotech REX & AI Extension for Microsoft MakeCode
Custom blocks for the advanced educational robotics ecosystem from **[
robotech.edu.pl](https://robotech.edu.pl)**.

This extension provides a hardware-abstracted block interface for the
**Robotech REX Expansion Board** paired with any **Universal Vision AI
Camera Module** running custom TinyML models.

## UART Communication Protocol

The micro:bit communicates with the Robotech REX mainboard and the AI camera module using a lightweight, text-based serial protocol via UART (9600 baud, 8N1). 

### Frame Structure
Every data packet follows a strict modular blueprint separated by semicolons (`;`) and terminates with a newline character (`\n`):

1. **Target Identification** (`to:rex;`, `to:ai;`, or `to:mb;`) – Directs which subsystem must parse the upcoming data.
2. **Operation Type** (`cmd:...;` for output commands/requests or `res:...;` for input data responses).
3. **Data Parameters** (`parameter:value;`) – Key-value arguments specific to the current command.
4. **Line Terminator** (`\n`) – Emitted automatically by the MakeCode serial hardware wrapper.

---

### 1. Outbound Packets (From micro:bit TO Hardware)

#### Robotech REX Mainboard (`to:rex;`)
* **Group Servo Movement (S0-S3 angles + execution speed):**
  `to:rex;cmd:move;s0:90;s1:90;s2:90;s3:90;time:500;\n`
* **Pin Mode Setup (Universal Pins S0-S3):**
  `to:rex;cmd:pin-mode;pin:0;mode:out;\n` *(Supported modes: `out`, `in`, `pwm`, `adc`)*
* **Digital/PWM Output Control:**
  `to:rex;cmd:pin-write;pin:0;val:512;\n`
* **Trigger Analog-to-Digital Conversion (ADC):**
  `to:rex;cmd:adc-read;pin:1;\n`
* **DC Motor Speed & Direction:**
  `to:rex;cmd:motor;num:1;speed:50;\n` *(Speed range: `-100` to `100`)*
* **Addressable WS2812B RGB LED Control:**
  `to:rex;cmd:rgb;index:0;r:255;g:0;b:0;\n`
* **Request 1-Wire Thermal Sensor Readout:**
  `to:rex;cmd:1w-read;\n`

#### Robotech AI Module (`to:ai;`)
* **Snapshot Background Frame:**
  `to:ai;cmd:snap_bg;\n`
* **Snapshot Tracking Target Object:**
  `to:ai;cmd:snap_obj;\n`
* **Deploy Wi-Fi Access Point (AP):**
  `to:ai;cmd:ap_ON;ssid:robotech-AI;pass:123456789;\n`
* **Kill Wi-Fi Access Point (AP):**
  `to:ai;cmd:ap_OFF;\n`
* **Toggle Face Detection Algorithm:**
  `to:ai;cmd:face_detect_ON;\n` or `to:ai;cmd:face_detect_OFF;\n`
* **Camera Sensor Power Management:**
  `to:ai;cmd:camera;status:on;\n` or `to:ai;cmd:camera;status:off;\n`

---

### 2. Inbound Packets (From Hardware TO micro:bit)
Processed asynchronously inside the extension's background loop by filtering frames prefixed with `to:mb;`.

* **1-Wire Temperature Stream:**
  `to:mb;res:1w;temp:24;\n`
* **ADC Raw Voltage Reading:**
  `to:mb;res:adc;pin:1;val:512;\n`
* **Face Tracker Output (Active target locking with X,Y centroid coordinates):**
  `to:mb;res:face_detect;val:true;x:95;y:45;\n`
* **Face Tracker Target Lost:**
  `to:mb;res:face_detect;val:false;\n`


## License
MIT License. Open-source hardware and software ecosystem developed for
educational excellence at robotech.edu.pl.
