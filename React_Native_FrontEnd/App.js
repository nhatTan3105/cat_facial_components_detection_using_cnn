import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform, StyleSheet, TouchableOpacity, Alert, Text, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const serverUrl = 'https://sloth-fast-thrush.ngrok-free.app';
export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false); // State để hiển thị chắn ngang

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          console.log(selectedImage)
        }
      }
    })();
  }, []);

  const sendImageToServer = async (apiEndpoint) => {
    if (selectedImage) {
      try {
        setLoading(true); // Bắt đầu hiển thị loading
        const formData = new FormData();
        formData.append('image', {
          uri: selectedImage,
          type: 'image/jpeg',
          name: 'image.jpg',
        });

        const response = await fetch(`${serverUrl}${apiEndpoint}`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Response Status:', response.status);
        console.log('Response Headers:', response.headers);
        
        // Check if the response status is successful
        if (response.ok) {
          // Assume the response is an image; you may need to adjust this based on your actual server response
          const blob = await response.blob();
          setSelectedImage(URL.createObjectURL(blob));
        } else {
          console.error('Server returned an error:', response.statusText);
        }
      } catch (error) {
        console.error('Error sending image to server:', error.message);
      } finally {
        setLoading(false); // Kết thúc hiển thị loading
      }
    }
  };

  
  const pickImageAndDetect = async () => {
    try {
      setShowOverlay(true); // Hiển thị overlay
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setTimeout(() => {
          setShowOverlay(false); // Ẩn overlay sau 1.5 giây
          setLoading(false); // Kết thúc hiển thị loading
        }, 1500);
        // Log the size of the selected image
        Image.getSize(
          result.assets[0].uri,
          (width, height) => {
            console.log(`Image size: ${width} x ${height}`);
            // Tạo FormData để chứa hình ảnh
            const formData = new FormData();
            formData.append('image', {
              uri: result.assets[0].uri,
              type: 'image/jpeg',
              name: 'image.jpg',
            });

            // Gửi hình ảnh đến API /detect
            fetch(`${serverUrl}/detect`, {
              method: 'POST',
              body: formData,
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            })
            .then(response => {
              console.log('Response Status:', response.status);
              console.log('Response Headers:', response.headers);
              if (!response.ok) {
                console.error('Server returned an error:', response.statusText);
              }
            })
            .catch(error => {
              console.error('Error sending image to server:', error.message);
            });
          },
          (error) => {
            console.error('Error getting image size:', error);
          }
        );
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  const downloadImage = async () => {
    setShowOverlay(true); // Ẩn overlay sau 1.5 giây
    setLoading(true); // Kết thúc hiển thị loading
    if (selectedImage) {
      try {
        const formData = new FormData();
        formData.append('image', {
          uri: selectedImage,
          type: 'image/jpeg',
          name: 'image.jpg',
        });
  
        const response = await fetch('https://api.imgbb.com/1/upload?expiration=600&key=0f7c20ac05f44e03262a86767eb54159', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        if (response.ok) {
          const responseData = await response.json();
          const imageUrl = responseData.data.url;
  
          // Download the image using FileSystem
          const downloadedImage = await FileSystem.downloadAsync(
            imageUrl,
            FileSystem.documentDirectory + 'downloaded_image.jpg'
          );
  
          // Save the downloaded image to the media library
          await MediaLibrary.saveToLibraryAsync(downloadedImage.uri);
          console.log('Image saved to Camera Roll!');
          Alert.alert('Thông báo', 'Tải ảnh thành công')
          setShowOverlay(false); // Ẩn overlay sau 1.5 giây
          setLoading(false); // Kết thúc hiển thị loading
        } else {
          console.error('Server returned an error:', response.statusText);
        }
      } catch (error) {
        console.error('Error downloading image:', error.message);
      }
    }
    else
      Alert.alert('Thông báo', 'Không thể tải ảnh')
  };

  const handleGlassesPress = () => {
    sendImageToServer('/glasses');
  };

  const handleHatPress = () => {
    sendImageToServer('/hat');
  };

  const handleBeardPress = () => {
    sendImageToServer('/beard');
  };

  const handleDownloadPress = () => {
    // Thực hiện chức năng tải ảnh ở đây
    downloadImage()
  };

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.appName}>
          <Image source={require('./assets/appName.png')}  />
        </View>
      </View>
      <View style={styles.imageContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <Image source={require('./assets/selectImage.png')} style={styles.image} />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleGlassesPress}>
          <Image source={require('./assets/button1.png')} style={styles.imageButton} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleHatPress}>
          <Image source={require('./assets/button2.png')} style={styles.imageButton} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBeardPress}>
          <Image source={require('./assets/button3.png')} style={styles.imageButton} />
        </TouchableOpacity>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={pickImageAndDetect}>
          <Image source={require('./assets/selectImageIcon.png')} style={styles.buttonImage} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDownloadPress}>
          <Image source={require('./assets/download.png')} style={styles.buttonImage} />
        </TouchableOpacity>
      </View>
      {showOverlay && <View style={styles.overlay}></View>}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: 350,
    height: 350,
    borderRadius: 15,
    borderWidth: 2,  // Set the width of the border
    borderColor: 'grey',  // Set the color of the border
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
    width: '80%',
  },
  imageButton: {
    width: 100,
    height: 100,
    borderWidth: 2,  // Set the width of the border
    borderColor: 'grey',  // Set the color of the border
    borderRadius: 10,  // Set the border radius to make rounded corners
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  buttonImage: {
    width: 50,
    height: 50,
    marginTop: 10,
  },
  text: {
    fontSize: 20,
    fontStyle: 'italic',
    marginBottom: 50,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Màu đen mờ với độ trong suốt 50%
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    padding: 0,
    marginBottom: 10,
  }
});
