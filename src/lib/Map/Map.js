import React from 'react'
import { View, Platform } from 'react-native'
import CenterIdentity from 'centeridentity';
import MapView from 'react-native-web-maps';
import { Circle, Marker } from 'react-google-maps';
import openMap from 'react-native-open-maps';


export default class Map extends React.Component {
  constructor(props) {
    super(props);
  }
  render () {
    const { height, width, markers, circles, style, source, option, onLoadStart, onLoad, onError, onLoadEnd, onMessage, renderLoading, renderError } = this.props
    const location = markers ? markers[0] : {lat: 37.9838, lng: 23.7275};
    return <View style={{...this.props.style, width, height}}>
      <MapView 
        initialRegion={{latitude: location.lat, longitude: location.lng}}
        defaultZoom={15}
        onPress={(e)=> {this.props.mapPress(e)}}
      >
        {
          circles && circles.map((circle, index) => 
            <Circle
              center={circle.coords}
              radius={circle.radius}
              options={{
                fillColor: circle.background,
                strokeColor: circle.border
              }}
              key={index}
            />
          )
        }
        {markers && markers.filter((coords) => {
          return coords ? true : false;
        }).map((coords)=> {
          console.log(coords);
          return <Marker
          position={{lat: coords.lat, lng: coords.lng}}
          onClick={() => {
            if(window && window.open) {
              window.open('https://www.google.com/maps/dir/?api=1&destination=' + coords.lat + ',' + coords.lng)
            } else {
              openMap({ latitude: coords.lat, longitude: coords.lng })
            }
          }}
        />})}
      </MapView>
    </View>
  }
}
