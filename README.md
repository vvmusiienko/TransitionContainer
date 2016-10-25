TransitionContainer is React Native component.

If you need to replace some view with another view animated then TransitionContainer might help you with that.
Standart Navigator component seems to be overkill for this purposes and simply not designed for such things. And I was unable to find any documentation how to achieve it, so writted this little component.

There is available 6 predefined animations and you can easily add your custom animation by modifing handleAnimation method.

## Installation

Just copy TransitionContainer.js into your project and import it as

```javascript
var TransitionContainerModule = require('./TransitionContainer');
var {
  TransitionContainer,
  TransitionAnim,
} = TransitionContainerModule;
```

## Example of usage

![alt tag](https://github.com/muhaos/TransitionContainer/blob/master/demo.gif)


```javascript

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';

var TransitionContainerModule = require('./TransitionContainer');
var {
  TransitionContainer,
  TransitionAnim,
} = TransitionContainerModule;


class TestView extends Component {
  render() {
    return (
      <View style={{flex:1, alignItems: 'center', justifyContent: 'center', backgroundColor:this.props.color}}>
        <Text>Test View</Text>
      </View>
    );
  }
}


export default class TransitionContainerTest extends Component {

  constructor(props) {
    super(props);
    this.state = {anim:1}
  }

  randomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  nextAnim() {
    var anim = this.state.anim;
    anim ++;
    if (anim >= TransitionAnim.allVariants().length) {
      anim = 1;
    }
    return anim;
  }

  _onPresed = () => {
      this.setState({anim:this.nextAnim()})
      this.transitionContainer.replaceWith(TestView, {color:this.randomColor()});
  }

  render() {
    return (
      <View style={styles.container}>
        
        <TouchableOpacity
          onPress={this._onPresed} style={styles.buttonContainer}>
          <View style={{}}>
              <Text>
                Press Here to Change view
              </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.demoContainer}>

          <TransitionContainer style={{flex:1}}
            ref={component => this.transitionContainer = component}
            initialComponent={TestView}
            initialComponentProps={{color:"#FFFFFF"}}
            animation={this.state.anim}
            animationDuration={500}
            >
          </TransitionContainer>

        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  buttonContainer: {
    flex: 1,
    margin: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#9f9f9f",
  },
  demoContainer: {
    flex: 2,
    margin: 50,
  },
});

AppRegistry.registerComponent('TransitionContainerTest', () => TransitionContainerTest);

```

