# tuyarest

A Tuya device REST API server

---

In progress

---

### Quick Usage

```
$ npm i -g tuyarest
$ tuyarest
server listening on http://0.0.0.0:3000
```

### API

**GET** /`host` - Get all DPS values
**GET** /`host`/`dps` - Get particular DPS value
**PUT** /`host`/`dps` - Set particular DPS value (Empty body toggles current value, Non-empty body be `Content-type: application/json`)
