import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  imageUriToBase64,
  verifyActivity as verifyActivityAI,
} from '../../utils/aiService';

/**
 * A single-screen flow that:     
 *   1. Requests runtime camera permission     
 *   2. Shows a live preview via `expo-camera`     
 *   3. Lets the user capture, preview, retake, and verify the image with OpenAI Vision
 */
export default function ActivityCaptureScreen() {
  /* -------------------------------------------------------------------------
   * Local state & refs
   * -----------------------------------------------------------------------*/
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  // In a production app this would be passed via route params.
  const activityDescription = 'Programming on a computer';

  /* -------------------------------------------------------------------------
   * Helpers
   * -----------------------------------------------------------------------*/
  const handleCapture = async () => {
    if (!cameraRef.current || !isCameraReady) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      console.log('Photo captured:', photo);
      setPhotoUri(photo.uri);
    } catch (err) {
      console.error('takePictureAsync failed', err);
      Alert.alert('Camera Error', 'Unable to capture photo. Please try again.');
    }
  };

  const handleVerify = async () => {
    if (!photoUri) return;
    setIsVerifying(true);
    try {
      console.log('Verifying activity with AI...');
      const result = await verifyActivityAI(photoUri, activityDescription);
      Alert.alert(
        result.verified ? 'Activity Verified!' : 'Verification Failed',
        `Confidence: ${result.confidence}%\n\n${result.explanation}`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (result.verified) router.back();
            },
          },
        ],
      );
    } catch (err) {
      console.error('verifyActivity failed', err);
      Alert.alert(
        'Verification Error',
        'There was an error verifying your activity. Please try again.',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  /* -------------------------------------------------------------------------
   * Render guards (permission flow)
   * -----------------------------------------------------------------------*/
  if (!permission) {
    // Permission state is still loading.
    return <View style={styles.container} />;
  }

  if (!permission.granted && !photoUri) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to use the camera
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Ionicons name="camera" size={22} color="#fff" />
          <Text style={styles.btnText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* -------------------------------------------------------------------------
   * UI
   * -----------------------------------------------------------------------*/
  return (
    <View style={styles.container}>
      {/* Camera preview OR captured image */}
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      ) : (
        <CameraView
          ref={cameraRef}
          style={styles.preview}
          facing={facing}
          onCameraReady={() => setIsCameraReady(true)}
          enableTorch={false}
          mirror={facing === 'front'}
        />
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {photoUri ? (
          <>
            <TouchableOpacity
              style={[styles.btn, styles.danger]}
              disabled={isVerifying}
              onPress={() => setPhotoUri(null)}
            >
              <Ionicons name="refresh" size={22} color="#fff" />
              <Text style={styles.btnText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.success]}
              disabled={isVerifying}
              onPress={handleVerify}
            >
              {isVerifying ? (
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              ) : (
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
              )}
              <Text style={styles.btnText}>
                {isVerifying ? 'Verifying…' : 'Verify'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.btn}
            disabled={!isCameraReady}
            onPress={handleCapture}
          >
            <Ionicons name="camera" size={22} color="#fff" />
            <Text style={styles.btnText}>Capture</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.activityText}>
        Current activity: {activityDescription}
      </Text>
    </View>
  );
}

/* ---------------------------------------------------------------------------
 *  Styles
 * -------------------------------------------------------------------------*/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#000',
  },
  permissionText: { textAlign: 'center', color: '#fff', marginBottom: 24 },
  permissionBtn: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  preview: { flex: 1 },
  controls: { padding: 20 },
  btn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 16,
    marginBottom: 12,
  },
  danger: { backgroundColor: '#e74c3c' },
  success: { backgroundColor: '#2ecc71' },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  activityText: {
    textAlign: 'center',
    color: '#fff',
    marginBottom: Platform.OS === 'ios' ? 34 : 20,
  },
});