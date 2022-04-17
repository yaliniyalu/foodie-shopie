import { AndroidPermissions } from '@ionic-native/android-permissions';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Capacitor } from "@capacitor/core";
import {Geolocation} from "@capacitor/geolocation";
import axios from "axios";

const LocationService = {
  checkGPSPermission: async () => {
    return await new Promise((resolve, reject) => {
      if (Capacitor.isNativePlatform()) {
        AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION)
          .then(
            result => {
              if (result.hasPermission) {
                resolve(true);
              } else {
                resolve(false);
              }
            },
            err => { alert(err); }
          );
      }
      else { resolve(true);  }
    })
  },

  requestGPSPermission: async () => {
    return await new Promise((resolve, reject) => {
      LocationAccuracy.canRequest()
        .then((canRequest) => {
          if (canRequest) {
            resolve('CAN_REQUEST');
          } else {
            AndroidPermissions.requestPermission(AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION)
              .then(
                result => {
                  if (result.hasPermission) {
                    resolve('GOT_PERMISSION');
                  } else {
                    resolve('DENIED_PERMISSION');
                  }
                },
                error => {
                  alert('requestPermission Error requesting location permissions ' + error);
                }
              );
          }
        });
    })
  },

  askToTurnOnGPS: async () => {
    return await new Promise((resolve, reject) => {
      LocationAccuracy.canRequest().then((canRequest) => {
        if (canRequest) {1
          LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
            .then(() => {
                resolve(true);
              },
              error => { resolve(false); } );
        }
        else { resolve(false);  }
      });
    })
  },

  getLocationPermission: async () => {
    const hasPermission = await LocationService.checkGPSPermission();
    if (hasPermission) {
      if (Capacitor.isNativePlatform()) {
        const canUseGPS = await LocationService.askToTurnOnGPS();
        if (!canUseGPS) {
          throw new Error("Please turn on location")
        }
      }
    }
    else {
      const permission = await LocationService.requestGPSPermission();
      if (permission === 'CAN_REQUEST' || permission === 'GOT_PERMISSION') {
        if (Capacitor.isNativePlatform()) {
          const canUseGPS = await LocationService.askToTurnOnGPS();
          if (!canUseGPS) {
            throw new Error("Please turn on location")
          }
        }
      } else {
        throw new Error("Location Access Denied")
      }
    }
  },

  getLocation: async function () {
    await this.getLocationPermission()
    return await Geolocation.getCurrentPosition();
  },

  getLocationSilent: async function (fallback = false) {
    try {
      const hasPermission = await LocationService.checkGPSPermission();
      if (hasPermission) {
        return await Geolocation.getCurrentPosition();
      }

      throw new Error("Location access denied")
    } catch (e) {
      if (fallback) {
        const res = await axios.get('https://geolocation-db.com/json/')
        if (!res.data.latitude || !res.data.longitude) {
          throw e;
        }

        return {coords: {latitude: res.data.latitude, longitude: res.data.longitude}}
      }
      throw e;
    }
  }
}
export default LocationService;
