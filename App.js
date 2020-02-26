import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Image,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
  CameraRoll,
  Share
} from 'react-native';

//import Permissions from 'expo-permissions';
import FileSystem from 'expo-file-system';
import Permissions from 'expo-image-picker';

import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      images: [],
      scale: new Animated.Value(1),
      isImageFocused: false
    };

    this.scale = {
      transform: [{ scale: this.state.scale }]
    };

    this.actionBarY = this.state.scale.interpolate({
      inputRange: [0.9, 1],
      outputRange: [0, -80]
    });
    this.borderRadius = this.state.scale.interpolate({
      inputRange: [0.9, 1],
      outputRange: [30, 0]
    });
  }

  loadWallpapers = () => {
    axios
      .get(
        'https://www.flickr.com/services/rest/?method=flickr.favorites.getList&api_key=f7a259ccf01293370e8cd8d754cb6aa4&user_id=184865006@N08&extras=views,%20url_c&per_page=20&page=1&format=json&nojsoncallback=1&fbclid=IwAR0WNmki0rofMt6OqzAeGMITD7sC-sZLqReZE2F9lFTEdG_JLwmyO32W3xA'
      )
      .then(
        function(response) {
          console.log(response.data.photos.photo);
          this.setState({ images: response.data.photos.photo, isLoading: false });
        }.bind(this)
      )
      .catch(function(error) {
        console.log(error);
      })
      .finally(function() {
        console.log('request completed');
      });
  };

  componentDidMount() {
    this.loadWallpapers();
  }

  saveToCameraRoll = async image => {
    let cameraPermissions = await Permissions.getAsync(Permissions.CameraRoll);
    if (cameraPermissions.status !== 'granted') {
      cameraPermissions = await Permissions.askAsync(Permissions.CameraRoll);
    }

    if (cameraPermissions.status == 'granted') {
      FileSystem.downloadAsync(
        image.url_c,
        FileSystem.documentDirectory + image.id + '.jpg'
      )
        .then(({ uri }) => {
          CameraRoll.saveToCameraRoll(uri);
          alert('Saved to photos');
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      alert('Requires cameral roll permission');
    }
  };

  showControls = item => {
    this.setState(
      state => ({
        isImageFocused: !state.isImageFocused
      }),
      () => {
        if (this.state.isImageFocused) {
          Animated.spring(this.state.scale, {
            toValue: 0.9
          }).start();
        } else {
          Animated.spring(this.state.scale, {
            toValue: 1
          }).start();
        }
      }
    );
  };

  shareWallpaper = async image => {
    try {
      await Share.share({
        message: 'Checkout this wallpaper ' + image.url_c
      });
    } catch (error) {
      console.log(error);
    }
  };

  renderItem = ({ item }) => {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'black',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ActivityIndicator size="large" color="grey" />
        </View>
        <TouchableWithoutFeedback onPress={() => this.showControls(item)}>
          <Animated.View style={[{ height, width }, this.scale]}>
            <Animated.Image
              style={{
                flex: 1,
                height: null,
                width: null,
                borderRadius: this.borderRadius
              }}
              source={{ uri: item.url_c }}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: this.actionBarY,
            height: 80,
            backgroundColor: 'black',
            flexDirection: 'row',
            justifyContent: 'space-around'
          }}
        >
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => this.loadWallpapers()}
            >
              <Ionicons name="ios-refresh" color="white" size={40} />
            </TouchableOpacity>
          </View>
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => this.shareWallpaper(item)}
            >
              <Ionicons name="ios-share" color="white" size={40} />
            </TouchableOpacity>
          </View>
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => this.saveToCameraRoll(item)}
            >
              <Ionicons name="ios-save" color="white" size={40} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };
  render() {
    return this.state.isLoading ? (
      <View
        style={{
          flex: 1,
          backgroundColor: 'black',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ActivityIndicator size="large" color="grey" />
      </View>
    ) : (
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <FlatList
          scrollEnabled={!this.state.isImageFocused}
          horizontal
          pagingEnabled
          data={this.state.images}
          renderItem={this.renderItem}
          keyExtractor={item => item.id}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
// import * as React from 'react';
// import { CameraRoll, Text, View, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Animated, TouchableWithoutFeedback, TouchableHighlight, Share } from 'react-native';
// import Constants from 'expo-constants';

// import * as Permissions from 'expo-permissions'
// import * as FileSystem from 'expo-file-system'
// import axios from 'axios';
// // You can import from local files


// // or any pure javascript modules available in npm
// import { Card } from 'react-native-paper';

// class WallPapers extends React.Component {
//   animatedScale = new Animated.Value(1)
//   animatedPosition = new Animated.Value(-100)

//   state = {
//     isTapped: false
//   }
//   handlePress = () => {

//     let tempTap = this.state.isTapped;
//     this.setState({
//       isTapped: !tempTap
//     }, () => {
//       if (this.state.isTapped) {
//         Animated.parallel([
//           Animated.timing(this.animatedScale, {
//             toValue: 0.6,
//             duration: 300
//           }),
//           Animated.timing(this.animatedPosition, {
//             toValue: 80,
//             duration: 300
//           })
//         ]).start();
//       } else {
//         Animated.parallel([
//           Animated.timing(this.animatedScale, {
//             toValue: 1,
//             duration: 300
//           }),
//           Animated.timing(this.animatedPosition, {
//             toValue: -100,
//             duration: 300
//           })
//         ]).start();
//       }
//     })
//   }
//   handleScroll = () => {
//     if (this.state.isTapped) {
//       this.handlePress();
//     }
//   }
//   handleSave = async img => {
//     let cameraPermissions = await Permissions.getAsync(Permissions.CameraRoll);
//     if (cameraPermissions.status !== 'granted') {
//       cameraPermissions = await Permissions.askAsync(Permissions.CameraRoll);
//     }
//     if (cameraPermissions.status === 'granted') {
//       FileSystem.downloadAsync(img.urls.regular, FileSystem.documentDirectory + img.id + '.jpg')
//         .then(({ uri }) => {
//           CameraRoll.saveToCameraRoll(uri);
//           alert('Saved To Gallery');
//           this.handlePress();
//         })
//         .catch(err => {
//           alert('Error!')
//         })
//     } else {
//       alert('Requires Camera Roll Permission');
//     }
//   }

//   handleShare = async (img) => {
//     const shareOptions = {
//       title: 'Checkout this amazing wallpaper!' + img

//     };
//     try {
//       await Share.share(shareOptions)
//       this.handlePress()

//     } catch (err) {
//       alert('Error in sharing the image')
//     }


//   }
//   render() {
//     let { height, width } = Dimensions.get('screen')
//     let tempWidth = width - 50
//     return (
//       <ScrollView onScroll={this.handleScroll} style={{ height: height, width: width, backgroundColor: 'black' }} pagingEnabled={true} horizontal={true}>
//         {this.props.imgs.map(img => <View key={img.id} style={{ alignItems: 'center', height: height, width: width }}>
//           <Animated.View style={{ height: height, width: width, transform: [{ scaleX: this.animatedScale }, { scaleY: this.animatedScale }] }}>
//             <TouchableWithoutFeedback onPress={this.handlePress}>
//               <Animated.Image style={{ flex: 1, height: null, width: null }} source={{ uri: img.urls.regular }} />


//             </TouchableWithoutFeedback>
//           </Animated.View>
//           <Animated.View style={{ height: 100, width: tempWidth, bottom: this.animatedPosition, backgroundColor: '#ddd', position: 'absolute', zIndex: 5, borderRadius: 10, flexDirection: 'row' }}>
//             <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
//               <TouchableHighlight onPress={() => this.handleSave(img)}><Text>Save</Text></TouchableHighlight>
//               <TouchableHighlight><Text>Refresh</Text></TouchableHighlight>
//               <TouchableHighlight onPress={() => this.handleShare(img.urls.regular)}><Text>Share</Text></TouchableHighlight>
//             </View>
//           </Animated.View>

//         </View>)}
//       </ScrollView>
//     )
//   }
// }




// export default class App extends React.Component {
//   state = {
//     isLoading: true,
//     isTapped: false,
//     imgs: []
//   }

//   animatedScale = new Animated.Value(1)
//   animatedPosition = new Animated.Value(-100)

//   handleSave = async img => {
//     let cameraPermissions = await Permissions.getAsync(Permissions.CAMERA_ROLL);
//     if (cameraPermissions.status !== 'granted') {
//       cameraPermissions = await Permissions.askAsync(Permissions.CAMERA_ROLL);
//     }
//     if (cameraPermissions.status === 'granted') {
//       FileSystem.downloadAsync(img.urls.regular, FileSystem.documentDirectory + img.id + '.jpg')
//         .then(({ uri }) => {
//           CameraRoll.saveToCameraRoll(uri);
//           alert('Saved To Gallery');
//         })
//         .catch(err => {
//           alert('Error!')
//         })
//     } else {
//       alert('Requires Camera Roll Permission');
//     }
//   }
//   handlePress = () => {

//     let tempTap = this.state.isTapped;
//     this.setState({
//       isTapped: !tempTap
//     }, () => {
//       if (this.state.isTapped) {
//         Animated.parallel([
//           Animated.timing(this.animatedScale, {
//             toValue: 0.6,
//             duration: 300
//           }),
//           Animated.timing(this.animatedPosition, {
//             toValue: 80,
//             duration: 300
//           })
//         ], {
//           useNativeDriver: true
//         }).start();
//       } else {
//         Animated.parallel([
//           Animated.timing(this.animatedScale, {
//             toValue: 1,
//             duration: 300
//           }),
//           Animated.timing(this.animatedPosition, {
//             toValue: -100,
//             duration: 300
//           })
//         ], {
//           useNativeDriver: true
//         }).start();
//       }
//     })
//   }
//   handleShare = (img) => {
//     const shareOptions = {
//       title: 'Checkout this amazing wallpaper!',
//       message: '',
//       url: img,
//       subject: ''
//     };

//     Share.share(shareOptions);
//   }

//   loadNewImgs = () => {
//     let Access_Key = '896979fdb70f80865638d7a4648bf9ce309675335318933eab2bf990af42e295'; //replace the Access Key here
//     axios.get('https://api.unsplash.com/photos/random?count=10&client_id=' + Access_Key).then(data => {
//       this.setState({ imgs: data.data, isLoading: false });
//       if (this.state.isTapped) {
//         this.handlePress();
//       }

//     })
//       .catch(err => {
//         console.log('Error happened during fetching!', err);
//       });
//   }

//   componentDidMount = () => {
//     this.loadNewImgs();
//   }
//   render() {
//     if (this.state.isLoading) {
//       return (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
//           <ActivityIndicator size='large' />
//         </View>
//       )
//     } else {
//       let { height, width } = Dimensions.get('screen')
//       let tempWidth = width - 50
//       return (
//         <View style={styles.container}>
//           <ScrollView style={{ height: height, width: width, backgroundColor: 'black' }} pagingEnabled={true} horizontal={true}>
//             {this.state.imgs.map(img => <View key={img.id} style={{ alignItems: 'center', height: height, width: width }}>
//               <Animated.View style={{ height: height, width: width, transform: [{ scaleX: this.animatedScale }, { scaleY: this.animatedScale }] }}>
//                 <TouchableWithoutFeedback onPress={this.handlePress}>
//                   <Animated.Image style={{ flex: 1, height: null, width: null }} source={{ uri: img.urls.regular }} />


//                 </TouchableWithoutFeedback>
//               </Animated.View>
//               <Animated.View style={{ height: 100, width: tempWidth, bottom: this.animatedPosition, backgroundColor: '#ddd', position: 'absolute', zIndex: 5, borderRadius: 10, flexDirection: 'row' }}>
//                 <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
//                   <TouchableHighlight style={{ padding: 10 }} onPress={() => this.handleSave(img)}><Text>Save</Text></TouchableHighlight>

//                   <TouchableHighlight style={{ padding: 10 }} onPress={() => this.handleShare(img.urls.regular)}><Text>Share</Text></TouchableHighlight>
//                   <TouchableHighlight style={{ padding: 10 }} onPress={this.loadNewImgs}><Text>Refresh</Text></TouchableHighlight>
//                 </View>
//               </Animated.View>

//             </View>)}
//           </ScrollView>
//         </View>
//       )


//     }
//   }

// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,

//     paddingTop: Constants.statusBarHeight,
//     backgroundColor: 'black'

//   },

// });