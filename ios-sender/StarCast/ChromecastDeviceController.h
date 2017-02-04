// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#import <Foundation/Foundation.h>
#import <GoogleCast/GoogleCast.h>

/**
 * The delegate to ChromecastDeviceController. Allows responsding to device and
 * media states and reflecting that in the UI.
 */
@protocol ChromecastControllerDelegate<NSObject>

@optional

/**
 * Called when chromecast devices are discovered on the network.
 */
- (void)didDiscoverDeviceOnNetwork;

/**
 * Called when connection to the device was requested.
 *
 * @param device The device to which the connection is to be established.
 */
- (void)willConnectToDevice:(GCKDevice *)device;

/**
 * Called when connection to the device was established.
 *
 * @param device The device to which the connection was established.
 */
- (void)didConnectToDevice:(GCKDevice *)device;

/**
 * Called when connection to the device has failed.
 *
 * @param device The device to which the connection failed.
 */
- (void)didFailToConnectToDevice:(GCKDevice *)device;

/**
 * Called when connection to the device was closed.
 */
- (void)didDisconnect;

@end

/**
 * Controller for managing the Chromecast device. Provides methods to connect to
 * the device, launch an application, load media and control its playback.
 */
@interface ChromecastDeviceController : NSObject<GCKDeviceScannerListener, GCKDeviceManagerDelegate>

/** The device scanner used to detect devices on the network. */
@property(nonatomic) GCKDeviceScanner *deviceScanner;

/** The device manager used to manage conencted chromecast device. */
@property(nonatomic) GCKDeviceManager *deviceManager;

/** Get the friendly name of the device. */
@property(readonly, getter=getDeviceName) NSString *deviceName;

/** The UIBarButtonItem denoting the chromecast device. */
@property(nonatomic, readonly) UIBarButtonItem* chromecastBarButton;

/** The delegate attached to this controller. */
@property(nonatomic, assign) id<ChromecastControllerDelegate> delegate;

/** The volume the device is currently at **/
@property(nonatomic) float deviceVolume;

/** Current SessionID **/
@property(nonatomic, copy, readonly) NSString *sessionID;

/** Perform a device scan to discover devices on the network. */
- (void)toggleScan:(BOOL)start;

/** Connect to a specific Chromecast device. */
- (void)connectToDevice:(GCKDevice *)device;

/** Disconnect from a Chromecast device. */
- (void)disconnectFromDevice;

/** Stop receiver application and disconnect. */
- (void)stopAndDisconnectFromDevice;

/** Returns true if connected to a Chromecast device. */
- (BOOL)isConnected;

/** Increase or decrease the volume on the Chromecast device. */
- (void)adjustVolume:(BOOL)goingUp;

/** Prevent automatically reconnecting to the cast device if we see it again. */
- (void)clearPreviousSession;

@end