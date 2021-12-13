import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, TextInput, Text, Button, ActivityIndicator, Colors } from 'react-native-paper';
import CenterIdentity from 'centeridentity';

import { Provider as PaperProvider } from 'react-native-paper';
import Map from '../Map/Map';


const containerStyle = {backgroundColor: 'white', padding: 20};

export default class RecoverIdentity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ci: props.ci || new CenterIdentity(),
      publicUsername: '',
      privateUsername: '',
      lat: '',
      long: '',
      busy: false
    }
  }

  publicUsernameChange = (val) => {
    this.setState({
      publicUsername: val
    })
  }

  privateUsernameChange = (val) => {
    this.setState({
      privateUsername: val
    })
  }

  mapPress = async (e) => {
    if(this.state.busy) return;
    console.log(e.latLng.lat());
    console.log(e.latLng.lng());
    if(this.state.lat && this.state.long && (e.latLng.lat().toFixed(3) === this.state.lat && e.latLng.lng().toFixed(3) === this.state.long)) {
      this.setState({
        busy: true
      })
      setTimeout(async () => {
        try {
          var result = await this.props.ci.signInWithLocation(
            this.props.sessionIdUrl,
            this.state.privateUsername,
            this.state.publicUsername || this.props.publicUsername,
            this.state.lat,
            this.state.long,
            this.props.signinUrl
          )
          this.setState({
            busy: false
          })
          if (result.message === 'user not found') {
            this.setState({
              modalVisible: true
            })
            return;
          }
          if (result.status === true) {
            this.props.onSuccessfulSignIn(result);
          } else {
            this.props.onFailedSignIn(result);
          }
        } catch(err) {
          if (err.message === 'user not found') {
            this.setState({
              modalVisible: true
            })
          }
        }
      }, 1000)
    } else if(this.state.lat && this.state.long && (e.latLng.lat().toFixed(3) !== this.state.lat || e.latLng.lng().toFixed(3) !== this.state.long)) {
      this.setState({
        lat: e.latLng.lat().toFixed(3),
        long: e.latLng.lng().toFixed(3)
      })
    } else {
      this.setState({
        lat: e.latLng.lat().toFixed(3),
        long: e.latLng.lng().toFixed(3)
      })
    }
  }
  setModalVisible = (value) => {
    this.setState({
      modalVisible: value
    })
  }

  render() {
    return <PaperProvider><View style={{width: this.props.width, ...styles.container}}>
      <ActivityIndicator animating={this.state.busy} color={Colors.red800} />
      {!this.props.publicUsername && <TextInput label={this.props.publicUsernameLabel}
        onChange={(e) => {this.publicUsernameChange(e.currentTarget.value)}}
        value={this.state.publicUsername}
      />}
      <TextInput label={this.props.privateUsernameLabel}
        onChange={(e) => {this.privateUsernameChange(e.currentTarget.value)}}
        value={this.state.privateUsername}
      />
      <Map
        mapPress={this.mapPress}
        width={this.props.width} height={this.props.height}
      />
      <Portal>
        <Modal 
          visible={this.state.modalVisible}
          onDismiss={() => {this.setModalVisible(!this.state.modalVisible)}}
          contentContainerStyle={containerStyle}
        >
          <Text>{this.props.userNotFoundMessage}</Text>
          <Button style={{marginTop: 30}} onPress={async () => {
            this.setState({
              busy: true
            })
            setTimeout(async () => {
              this.setModalVisible(!this.state.modalVisible);

              var result = await this.props.ci.registerWithLocation(
                this.state.privateUsername,
                this.props.publicUsername,
                this.state.lat,
                this.state.long,
                this.props.extraData,
                this.props.registerUrl
              );
              this.setState({
                busy: false
              })
              if (result.status === true) {
                this.props.onSuccessfulRegister(result);
              } else {
                this.props.onFailedRegister(result);
              }
            }, 1000);
          }}>
            {this.props.createText}
          </Button>
          <Button style={{marginTop: 30}} onPress={() => {
            this.setModalVisible(!this.state.modalVisible);
          }}>
            {this.props.tryAgainText}
          </Button>
        </Modal>
      </Portal>
    </View>
    </PaperProvider>
  }
}

const styles = StyleSheet.create({
  container: {
  }
})

RecoverIdentity.propTypes = {
  ci: PropTypes.object,
  sessionIdUrl: PropTypes.string,
  registerUrl: PropTypes.string,
  signinUrl: PropTypes.string,
  successfulSignInUrl: PropTypes.string,
  userNotFoundMessage: PropTypes.string,
  publicUsername: PropTypes.string,
  publicUsernameLabel: PropTypes.string,
  privateUsernameLabel: PropTypes.string,
  extraData: PropTypes.object,
  onSuccessfulRegister: PropTypes.string,
  onSuccessfulSignIn: PropTypes.string,
  onFailedRegister: PropTypes.func,
  onFailedSignIn: PropTypes.func,
  createText: PropTypes.string,
  tryAgainText: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number
}
