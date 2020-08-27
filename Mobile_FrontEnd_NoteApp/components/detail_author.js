import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';

class DetailAuthor extends Component {
  constructor(props) {
    super(props);
    this.data = this.props.route.params;
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>List detail {JSON.stringify(this.data)}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DetailAuthor;
