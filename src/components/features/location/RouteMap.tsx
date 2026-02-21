/**
 * RouteMap Component
 * 
 * Displays a map with the user's current location and a route
 * to the delivery destination using Google Maps.
 * 
 * @format
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  Platform, 
  Linking, 
  TouchableOpacity
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { logger } from '@/utils/logger';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;

interface RouteMapProps {
  deliveryAddress: string;
  deliveryCoordinates?: {
    latitude: number;
    longitude: number;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  height?: number;
}

interface Location {
  latitude: number;
  longitude: number;
}


const RouteMap: React.FC<RouteMapProps> = ({
  deliveryAddress,
  deliveryCoordinates,
  currentLocation: providedCurrentLocation,
  height = 200,
}) => {
  // Validate API key
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <View style={[styles.container, styles.errorContainer, { height }]}>
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Configuration Error</Text>
          <Text style={styles.errorText}>
            Google Maps API key is not configured. Please set GOOGLE_MAPS_API_KEY in your .env file and rebuild the app.
          </Text>
        </View>
      </View>
    );
  }

  const [currentLocation, setCurrentLocation] = useState<Location | null>(
    providedCurrentLocation || null
  );
  const [destination, setDestination] = useState<Location | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(!providedCurrentLocation);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'permission' | 'unavailable' | 'timeout' | 'other' | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(!!providedCurrentLocation);

  // Open device settings
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasLocationPermission(true);
        getCurrentLocation();
      } else {
        setHasLocationPermission(false);
        setErrorType('permission');
        setError('Location permission denied. Please enable it in Settings.');
        setLoading(false);
      }
    } catch (err) {
      logger.error('Error requesting location permission', err);
      setErrorType('other');
      setError('Failed to request location permission');
      setLoading(false);
    }
  };

  // Update current location if provided as prop changes
  useEffect(() => {
    if (providedCurrentLocation) {
      setCurrentLocation(providedCurrentLocation);
      setHasLocationPermission(true);
      setLoading(false);
      initializeMap(providedCurrentLocation);
    }
  }, [providedCurrentLocation]);

  // Request location permission on mount only if location is not provided
  useEffect(() => {
    if (!providedCurrentLocation) {
      requestLocationPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get current location with improved error handling
  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    setErrorType(null);

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const locationData: Location = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(locationData);
      setHasLocationPermission(true);
      initializeMap(locationData);
    } catch (error: any) {
      logger.error('Error getting location', error);
      
      // Handle specific error types
      if (error.code === 'E_LOCATION_UNAVAILABLE') {
        setErrorType('unavailable');
        setError('Location information is unavailable');
      } else if (error.code === 'E_LOCATION_TIMEOUT') {
        setErrorType('timeout');
        setError('Location request timed out');
      } else if (error.code === 'E_LOCATION_PERMISSION_DENIED') {
        setErrorType('permission');
        setError('Location permission denied');
      } else {
        setErrorType('other');
        setError('Failed to get current location');
      }
      
      setLoading(false);
    }
  };

  // Retry getting location
  const handleRetry = async () => {
    try {
      await requestLocationPermission();
    } catch (error) {
      logger.error('Error retrying location permission', error);
      setError('Failed to request location permission. Please try again.');
    }
  };

  // Geocode delivery address to coordinates
  const geocodeAddress = async (address: string) => {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      } else {
        throw new Error('Geocoding failed');
      }
    } catch (err) {
      logger.error('Error geocoding address', err);
      return null;
    }
  };

  // Initialize map with both locations
  const initializeMap = async (userLocation: Location) => {
    try {
      let destinationLocation: Location | null = null;

      // Use provided coordinates or geocode the address
      if (deliveryCoordinates) {
        destinationLocation = deliveryCoordinates;
      } else if (deliveryAddress) {
        destinationLocation = await geocodeAddress(deliveryAddress);
      }

      if (destinationLocation) {
        setDestination(destinationLocation);
        
        // Calculate region to fit both points
        const minLat = Math.min(userLocation.latitude, destinationLocation.latitude);
        const maxLat = Math.max(userLocation.latitude, destinationLocation.latitude);
        const minLng = Math.min(userLocation.longitude, destinationLocation.longitude);
        const maxLng = Math.max(userLocation.longitude, destinationLocation.longitude);

        const latDelta = (maxLat - minLat) * 1.5; // Add padding
        const lngDelta = (maxLng - minLng) * 1.5;

        setRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: Math.max(latDelta, 0.01),
          longitudeDelta: Math.max(lngDelta, 0.01),
        });
      } else {
        // If we can't get destination, just show user location
        setRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }

      setLoading(false);
    } catch (err) {
      logger.error('Error initializing map', err);
      setError('Failed to initialize map');
      setLoading(false);
    }
  };

  // If location is provided, don't show permission request UI
  // Only show errors if they're not permission-related when location is provided
  if (providedCurrentLocation && error && errorType === 'permission') {
    // Don't show permission error if location is already provided
    setError(null);
    setErrorType(null);
  }

  if (loading && !providedCurrentLocation) {
    return (
      <View style={[styles.container, { height }]}>
        <ActivityIndicator size="large" color="#034703" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  // Render error message with helpful instructions
  const renderError = () => {
    // Don't show error UI if location is provided (permission already granted)
    if (providedCurrentLocation) return null;
    if (!error) return null;

    const getErrorInstructions = () => {
      switch (errorType) {
        case 'permission':
          if (Platform.OS === 'ios') {
            return (
              <>
                <Text style={styles.instructionText}>
                  To enable location access:
                </Text>
                <Text style={styles.stepText}>
                  1. Open Settings on your device{'\n'}
                  2. Scroll down and tap "Frontend"{'\n'}
                  3. Find "Location"{'\n'}
                  4. Select "While Using the App" or "Always"
                </Text>
              </>
            );
          } else {
            return (
              <>
                <Text style={styles.instructionText}>
                  To enable location access:
                </Text>
                <Text style={styles.stepText}>
                  1. Open Settings on your device{'\n'}
                  2. Go to Apps → Frontend{'\n'}
                  3. Tap Permissions{'\n'}
                  4. Enable Location permission
                </Text>
              </>
            );
          }
        case 'unavailable':
          return (
            <Text style={styles.instructionText}>
              Please check that location services are enabled on your device and try again.
            </Text>
          );
        case 'timeout':
          return (
            <Text style={styles.instructionText}>
              Location request took too long. Please check your connection and try again.
            </Text>
          );
        default:
          return (
            <Text style={styles.instructionText}>
              Please try again or check your device settings.
            </Text>
          );
      }
    };

    return (
      <View style={[styles.container, styles.errorContainer, { height }]}>
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Location Access Required</Text>
          <Text style={styles.errorText}>{error}</Text>
          {getErrorInstructions()}
          <View style={styles.buttonContainer}>
            {errorType === 'permission' && (
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={openSettings}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Open Settings</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (error) {
    return renderError();
  }

  if (!region) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.errorText}>Unable to load map</Text>
        <Text style={styles.diagnosticText}>
          Map region not available. Please check location permissions.
        </Text>
      </View>
    );
  }

  // Check if MapView is available
  if (!MapView) {
    return (
      <View style={[styles.container, styles.errorContainer, { height }]}>
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Map Component Error</Text>
          <Text style={styles.errorText}>
            MapView component is not available. Please ensure react-native-maps is properly installed.
          </Text>
          <Text style={styles.diagnosticText}>
            Run: cd ios && pod install && cd ..
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        loadingEnabled={true}
        loadingIndicatorColor="#034703"
        onMapReady={() => {
          logger.info('Map is ready');
        }}
        onError={(error) => {
          logger.error('MapView error', error);
          setError('Map failed to load. Please check your internet connection.');
          setErrorType('other');
        }}
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            pinColor="#034703"
          />
        )}
        {destination && (
          <Marker
            coordinate={destination}
            title="Delivery Address"
            pinColor="#FA7500"
          />
        )}
        {currentLocation && destination && (
          <MapViewDirections
            origin={currentLocation}
            destination={destination}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={3}
            strokeColor="#175FBE"
            optimizeWaypoints={true}
            onReady={(result) => {
              // Adjust region to fit the route
              if (result.coordinates && result.coordinates.length > 0) {
                const lats = result.coordinates.map((coord) => coord.latitude);
                const lngs = result.coordinates.map((coord) => coord.longitude);
                const minLat = Math.min(...lats);
                const maxLat = Math.max(...lats);
                const minLng = Math.min(...lngs);
                const maxLng = Math.max(...lngs);

                const latDelta = (maxLat - minLat) * 1.5;
                const lngDelta = (maxLng - minLng) * 1.5;

                setRegion({
                  latitude: (minLat + maxLat) / 2,
                  longitude: (minLng + maxLng) / 2,
                  latitudeDelta: Math.max(latDelta, 0.01),
                  longitudeDelta: Math.max(lngDelta, 0.01),
                });
              }
            }}
            onError={(errorMessage) => {
              logger.error('Directions error', errorMessage);
              // Don't set error state for directions errors, just log them
              // The map will still show markers even if directions fail
            }}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  errorContainer: {
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorContent: {
    width: '100%',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  diagnosticText: {
    fontSize: 12,
    color: '#828282',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  instructionText: {
    fontSize: 13,
    color: '#4C4C4C',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
  },
  stepText: {
    fontSize: 12,
    color: '#828282',
    textAlign: 'left',
    marginBottom: 16,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  settingsButton: {
    backgroundColor: '#034703',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 120,
  },
  retryButton: {
    backgroundColor: '#175FBE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 120,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#828282',
  },
});

export default RouteMap;

