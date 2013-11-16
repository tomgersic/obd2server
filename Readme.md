#OBD-II Logger (server side)

More information at [http://gersic.com/ive-connected-my-car-to-salesforce-com](http://gersic.com/ive-connected-my-car-to-salesforce-com)

Simple API to receive OBD-II Messages and log them in mongojs, with Diagnostic Trouble Codes  (DTC) being uploaded as Cases to Salesforce.com.

Also contains a simple log viewing api at  http://[SOMEDOMAINHERE.COM]/view/[VIN #]

This is intended for demo/POC purposes only. There's literally no security here, so you'll want to add some security measures if you're going to use this in a production environment.

###Example log GET request

http://[SOMEDOMAINHERE.COM]/log/{ obddata: { mode: '41', pid: '04', name: 'load_pct', value: 10.9375 },vin: 'JF1BJ673XPH968228',localdatetime: Sun Nov 10 2013 17:23:10 GMT+0000 (UTC),_id: 160 }


###Example RPM Value

{ mode: '41', pid: '0C', name: 'rpm', value: 706 }

###Example Error Code(response mode 43)

{ mode: '43', name: 'requestdtc', value: { errors: [ 'P0444', '-', '-' ] } }

###Salesforce Log Example

![https://pbs.twimg.com/media/BYwsmCzCAAA5qF1.png:large](https://pbs.twimg.com/media/BYwsmCzCAAA5qF1.png:large)