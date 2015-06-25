var util = require('util');
var async = require('async');
var request = require('request');
var http = require('http');
var SensorTag = require('./index');
var USE_READ = true;
var objtemp;
var ambtemp;
var accelx;
var accely;
var accelz;
var humd;
var humd_temp;
var magx;
var magy;
var magz;
var barp;
var gyrx;
var gyry;
var gyrz;
var n = 0;
var postdata;


/*specifiy your RESTful web service connection parameter here*/
var options = {
    host: 'you.yourhost.com',
    /*write your hostname here*/
    path: '/path/do/done/post',
    /*path to data post*/
    port: '80',
    /*port*/
    method: 'POST',
    /*method*/
    headers: {
        'your-api-key': 'write*api*key*here*',
        /*write your api key*/
        'content-type': 'application/json' /*write content type*/
    }
};


/*call back for your http post*/
post_callback = function(response) {

    /*check number of http call you  made*/
    console.log(" ------------- Observation : [" + n + "]");
    n = n + 1;
    var str = ''
    response.on('data', function(chunk) {
        str += chunk;
    });

    response.on('end', function() {
        console.log(str);
    });
}


/*SensorTag function*/
SensorTag.discover(function(sensorTag) {
    console.log('discovered: ' + sensorTag);

    /*notify disconnect*/
    sensorTag.on('disconnect', function() {
        console.log('disconnected!');
        process.exit(0);
    });

    /*month function to get specific format*/
    function show_now() {
        var my_month = new Date()
        var month_name = new Array(12);
        month_name[0] = "JAN"
        month_name[1] = "FEB"
        month_name[2] = "MAR"
        month_name[3] = "APR"
        month_name[4] = "MAY"
        month_name[5] = "JUN"
        month_name[6] = "JUL"
        month_name[7] = "AUG"
        month_name[8] = "SEP"
        month_name[9] = "OCT"
        month_name[10] = "NOV"
        month_name[11] = "DEC"
        return month_name[my_month.getMonth()];
    }

    /*format date according to specified format of RESTful web service*/
    function formatDate(d) {
        return d.getDate() + '-' + (show_now()) + "-" + d.getFullYear() +
            " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +
            " UTC";
    }


    async.series([

        /*connect and set up*/
        function(callback) {
            console.log('connectAndSetUp');
            sensorTag.connectAndSetUp(callback);
        },

        /*read device name*/
        function(callback) {
            console.log('readDeviceName');
            sensorTag.readDeviceName(function(error, deviceName) {
                console.log('\tdevice name = ' +
                    deviceName);
                callback();
            });
        },

        /*read MAC id*/
        function(callback) {
            console.log('readSystemId');
            sensorTag.readSystemId(function(error, systemId) {
                console.log('\tsystem id = ' + systemId);
                callback();

            });
        },

        /*enable Temparature sensor*/
        function(callback) {
            console.log('enableIrTemperature');
            sensorTag.enableIrTemperature(callback);
        },

        /*enable accelerometer sensor*/
        function(callback) {
            console.log('enableAccelerometer');
            sensorTag.enableAccelerometer(callback);
        },

        /*enable humidity*/
        function(callback) {
            console.log('enableHumidity');
            sensorTag.enableHumidity(callback);
        },

        /*enable accelerometer*/
        function(callback) {
            console.log('enableMagnetometer');
            sensorTag.enableMagnetometer(callback);
        },
        /*enable Barometric pressure sensor*/
        function(callback) {
            console.log('enableBarometricPressure');
            sensorTag.enableBarometricPressure(callback);
        },

        /*enable gyroscope sensor*/
        function(callback) {
            console.log('enableGyroscope');
            sensorTag.enableGyroscope(callback);
        },

        /*set time out to enable sensors properly*/
        function(callback) {
            setTimeout(callback, 2000);
            loop();
        }
    ])

    /*looping through sensor data to post*/
    function loop() {

        async.series([

            /*Temperature measurement*/
            function(callback) {
                if (USE_READ) {
                    sensorTag.readIrTemperature(function(
                        error, objectTemperature,
                        ambientTemperature) {
                        objtemp = objectTemperature
                            .toFixed(1);
                        ambtemp =
                            ambientTemperature.toFixed(
                                1);

                        /*Forming JSON for temperature and POST to RESTful service*/
                        postdata =
                            "write JSON, include sensor data and time with specified format of your RESTful web service";
                        var req = http.request(
                            options,
                            post_callback);
                        req.write(postdata);
                        req.end();

                        callback();
                    });
                } else {
                    sensorTag.on('irTemperatureChange',
                        function(objectTemperature,
                            ambientTemperature) {
                            objtemp = objectTemperature
                                .toFixed(1);
                            ambtemp =
                                ambientTemperature.toFixed(
                                    1);
                        });
                    sensorTag.setIrTemperaturePeriod(500,
                        function(error) {
                            sensorTag.notifyIrTemperature(
                                function(error) {
                                    setTimeout(
                                        function() {
                                            sensorTag
                                                .unnotifyIrTemperature(
                                                    callback
                                                );
                                        }, 5000
                                    );
                                });
                        });
                }
            },

            /*Accelerometer measurement*/
            function(callback) {
                if (USE_READ) {
                    sensorTag.readAccelerometer(function(
                        error, x, y, z) {
                        accelx = x.toFixed(1);
                        accely = y.toFixed(1);
                        accelz = z.toFixed(1);

                        /*Forming JSON for accelerometer and POST to RESTful service*/
                        postdata =
                            "write JSON, include sensor data and time with specified format of your RESTful web service";
                        var req = http.request(
                            options,
                            post_callback);
                        req.write(postdata);
                        req.end();
                        callback();
                    });
                } else {
                    sensorTag.on('accelerometerChange',
                        function(x, y, z) {
                            accelx = x.toFixed(1);
                            accely = y.toFixed(1);
                            accelz = z.toFixed(1);

                        });

                    sensorTag.setAccelerometerPeriod(500,
                        function(error) {
                            sensorTag.notifyAccelerometer(
                                function(error) {
                                    setTimeout(
                                        function() {
                                            sensorTag
                                                .unnotifyAccelerometer(
                                                    callback
                                                );
                                        }, 5000
                                    );
                                });
                        });
                }
            },

            /*Temperature and Humidity measurement*/
            function(callback) {
                if (USE_READ) {
                    sensorTag.readHumidity(function(error,
                        temperature, humidity) {
                        humd = humidity.toFixed(1);
                        humd_temp = temperature.toFixed(
                            1);

                        /*Forming JSON for Humidity and POST to RESTful service*/
                        postdata =
                            "write JSON, include sensor data and time with specified format of your RESTful web service";
                        var req = http.request(
                            options,
                            post_callback);
                        req.write(postdata);
                        req.end();
                        callback();
                    });
                } else {
                    sensorTag.on('humidityChange', function(
                        temperature, humidity) {
                        humd = humidity.toFixed(1);
                        humd_temp = temperature.toFixed(
                            1);
                    });

                    sensorTag.setHumidityPeriod(500,
                        function(error) {
                            sensorTag.notifyHumidity(
                                function(error) {
                                    setTimeout(
                                        function() {
                                            sensorTag
                                                .unnotifyHumidity(
                                                    callback
                                                );
                                        }, 5000
                                    );
                                });
                        });
                }
            },

            /*Magnetometer Measurement*/
            function(callback) {
                if (USE_READ) {
                    sensorTag.readMagnetometer(function(
                        error, x, y, z) {
                        magx = x.toFixed(1);
                        magy = y.toFixed(1);
                        magz = z.toFixed(1);

                        /*Forming JSON for Magnetometer and POST to RESTful service*/
                        postdata =
                            "write JSON, include sensor data and time with specified format of your RESTful web service";
                        var req = http.request(
                            options,
                            post_callback);
                        req.write(postdata);
                        req.end();
                        callback();
                    });
                } else {
                    sensorTag.on('magnetometerChange',
                        function(x, y, z) {
                            magx = x.toFixed(1);
                            magy = y.toFixed(1);
                            magz = z.toFixed(1);
                        });

                    sensorTag.setMagnetometerPeriod(500,
                        function(error) {
                            sensorTag.notifyMagnetometer(
                                function(error) {
                                    setTimeout(
                                        function() {
                                            sensorTag
                                                .unnotifyMagnetometer(
                                                    callback
                                                );
                                        }, 5000
                                    );
                                });
                        });
                }
            },

            /*Barometric Pressure Measurement*/
            function(callback) {
                if (USE_READ) {
                    sensorTag.readBarometricPressure(
                        function(error, pressure) {
                            barp = pressure.toFixed(1);

                            /*Forming JSON for Barometric Pressure and POST to RESTful service*/
                            postdata =
                                "write JSON, include sensor data and time with specified format of your RESTful web service";
                            var req = http.request(
                                options,
                                post_callback);
                            req.write(postdata);
                            req.end();
                            callback();
                        });
                } else {
                    sensorTag.on('barometricPressureChange',
                        function(pressure) {
                            barp = pressure.toFixed(1);
                        });
                    sensorTag.setBarometricPressurePeriod(
                        500, function(error) {
                            sensorTag.notifyBarometricPressure(
                                function(error) {
                                    setTimeout(
                                        function() {
                                            sensorTag
                                                .unnotifyBarometricPressure(
                                                    callback
                                                );
                                        }, 5000
                                    );
                                });
                        });
                }
            },

            /*Gyroscope measurement*/
            function(callback) {
                if (USE_READ) {
                    sensorTag.readGyroscope(function(error,
                        x, y, z) {
                        gyrx = x.toFixed(1);
                        gyry = y.toFixed(1);
                        gyrz = z.toFixed(1);

                        /*Forming JSON for Gyroscope and POST to RESTful service*/
                        postdata =
                            "write JSON, include sensor data and time with specified format of your RESTful web service";
                        var req = http.request(
                            options,
                            post_callback);
                        req.write(postdata);
                        req.end();
                        callback();
                    });
                } else {
                    sensorTag.on('gyroscopeChange',
                        function(x, y, z) {
                            gyrx = x.toFixed(1);
                            gyry = y.toFixed(1);
                            gyrz = z.toFixed(1);
                        });
                    sensorTag.setGyroscopePeriod(500,
                        function(error) {
                            sensorTag.notifyGyroscope(
                                function(error) {
                                    setTimeout(
                                        function() {
                                            sensorTag
                                                .unnotifyGyroscope(
                                                    callback
                                                );
                                        }, 5000
                                    );
                                });
                        });
                }
            },

            /*JSON creation example*/
            function(callback) {
                var jsonTem =
                    "[ { \"name\" : \"ObjTemp\", \"value\" :" +
                    objtemp +
                    " }, { \"name\" : \"AmbTemp\", \"value\" :" +
                    ambtemp + " } ]";
                var jsonAcc =
                    "[ { \"name : \"AccelX\", \"value\" :" +
                    accelx +
                    " }, { \"name\" : \"AccelY\", \"value\" :" +
                    accely +
                    " }, { \"name\" : \"AccelZ\", \"value\" :" +
                    accelz + " } ]";
                var jsonHum =
                    "[ { \"name\" : \"Humidity\", \"value\" :" +
                    humd +
                    " }, { \"name\" : \"Humidity_temp\", \"value\" :" +
                    humd_temp + " } ]";
                var jsonMag =
                    "[ { \"name\" : MagX, value :" + magx +
                    " }, { name : MagY, value :" + magy +
                    " }, { name : MagZ, value :" + magz +
                    " } ]";
                var jsonBar =
                    "[ { \"name\" : \"Barometric Pressure\", \"value\" :" +
                    barp + " } ]";
                var jsonGyr =
                    "[ { \"name\" : \"GyrX\", \"value\" :" +
                    gyrx +
                    " }, { \"name\" : \"GyrY\", \"value\" :" +
                    gyry +
                    " }, { \"name\" : \"GyrZ\", \"value\" :" +
                    gyrz + " } ]";
                var jsonTime = "{\"time\" : \"" +
                    formatDate(new Date()) + "\"}";

                console.log(jsonTem);
                console.log(jsonAcc);
                console.log(jsonHum);
                console.log(jsonMag);
                console.log(jsonBar);
                console.log(jsonGyr);
                console.log(jsonTime);

                callback()
            },

            /*recursive loop*/
            function(callback) {
                loop()
                callback()
            }

        ]);
    }
})
