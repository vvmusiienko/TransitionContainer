/* @flow */
'use strict';

var React = require('react');
var ReactNative = require('react-native');
var {
  StyleSheet,
  View,
  Animated,
  Dimensions,
  PixelRatio,
  Easing,
} = ReactNative;


const TransitionAnim = {
  // Instant views swap
  None:0,
  // Old view will go beside, new view will be under it
  SwipeFromRight: 1,
  SwipeFromLeft: 2,
  // Similar to non reversed anim but old view will stay at it's position while new view will go over it
  SwipeFromRightReversed: 3,
  SwipeFromLeftReversed: 4,
  // No movement, just opacity change
  CrossFade: 5,
  // the new view will pop in over old one
  PopIn: 6,

  allVariants:function(){return [this.None, this.SwipeFromRight, this.SwipeFromLeft, this.CrossFade, this.PopIn, this.SwipeFromRightReversed, this.SwipeFromLeftReversed]},
};


class TransitionContainer extends React.Component {

  static defaultProps = {};

  state: *;
  currentView: ?ReactElement<*> = null;
  nextView: ?ReactElement<*> = null;
  _animatedValue: Animated.Value;
  v_width: number;
  v_height: number;

  constructor(props: Object) {
    super(props);
    this.currentView = React.createElement(props.initialComponent, props.initialComponentProps);
    this.state = {animating_transition:false};
    this._animatedValue = null;
  }

  replaceWith(type: any, props: Object) : void {
    this.nextView = React.createElement(type, props);

    if (this.props.animation == TransitionAnim.None) {
      this.finishAnimation()
      return;
    }

    if (this._animatedValue !== null) {
      this._animatedValue.stopAnimation();
    }

    this._animatedValue = new Animated.Value(0);
    this._animatedValue.addListener(this.onAnimProgress.bind(this));
    Animated.timing(
      this._animatedValue,
      {
        toValue: 100,
        duration: this.props.animationDuration,
        easing: Easing.linear,
      }
    ).start(this.onAnimFinished.bind(this));

    this.setState({animating_transition:true});
  }

  // Internal use
  handleAnimation(n:number, animType:number, currentViewRef:View, nextViewRef:View) {
    var dx = -this.v_width * n
    var rdx = -this.v_width * (1 - n)

    switch (animType) {
      case TransitionAnim.None:
          return;

      case TransitionAnim.SwipeFromRightReversed:
        rdx = - rdx
      case TransitionAnim.SwipeFromLeftReversed:
        currentViewRef.setNativeProps({style:{
          opacity:1,
          transform:[],
          zIndex: 0,
        }});
        nextViewRef.setNativeProps({style:{
          opacity:n,
          transform:[{translateX:rdx}],
          zIndex: 1,
        }});
        break;

      case TransitionAnim.SwipeFromLeft:
        dx = - dx;
      case TransitionAnim.SwipeFromRight:
        currentViewRef.setNativeProps({style:{
          opacity:1.0 - n,
          transform:[{translateX:dx}]
        }});
        nextViewRef.setNativeProps({style:{
          opacity:n,
          transform:[]
        }});
        break;

        case TransitionAnim.CrossFade:
          currentViewRef.setNativeProps({style:{
            opacity:1.0 - n,
            transform:[],
          }});
          nextViewRef.setNativeProps({style:{
            opacity:1,
            transform:[],
          }});
          break;

        case TransitionAnim.PopIn:
        n = Easing.elastic(1.8)(n);
          currentViewRef.setNativeProps({style:{
            opacity:1,
            transform:[],
            zIndex: 0,
          }});
          nextViewRef.setNativeProps({style:{
            opacity:Math.min(n * 2, 1),
            transform:[{scale:0.5+(n/2.0)}],
            zIndex: 1,
          }});
          break;

      default:
    }
  }


  onAnimProgress(progressObj: Object): void {
    var n = (1.0 / 100.0) * progressObj.value
    var current_viewRef = 'current_view';
    var next_viewRef = 'next_view';
    this.refs[current_viewRef] && this.refs[next_viewRef] && this.handleAnimation(n, this.props.animation, this.refs[current_viewRef], this.refs[next_viewRef])
  }


  onAnimFinished(result: Object): void {
    if (result.finished === true) {
      this.finishAnimation()
    }
  }

  finishAnimation() {
    this.currentView = this.nextView;
    this.nextView = null;

    var current_viewRef = 'current_view';
    this.refs[current_viewRef] && this.refs[current_viewRef].setNativeProps({style:styles.currentScene});

    this._animatedValue = null;
    this.setState({animating_transition:false});
  }

  render() {

    var nextView = null;
    if (this.state.animating_transition === true) {
      nextView =
      <View ref={'next_view'} style={styles.futureScene}>
          {this.nextView}
      </View>;
    }

    return (
      <View style={styles.container}>

        {nextView}

        <View ref={'current_view'} style={styles.currentScene} onLayout={(event) => {
            var {x, y, width, height} = event.nativeEvent.layout;
            this.v_width = width;
            this.v_height = height;
          }} >
          {this.currentView}
        </View>

      </View>
    );
  }

}

var styles = StyleSheet.create({
  container: {
    paddingTop: 64,
    flex: 1,
    // flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '#F5F5F5',
  },
  currentScene: {
    position: 'absolute',
    overflow: 'hidden',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    opacity: 1.0,
    transform:[{translateX:0}],
  },
  futureScene: {
    position: 'absolute',
    overflow: 'hidden',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    // opacity: 1.0,
  },

});

// Specifies the default values for props:
TransitionContainer.defaultProps = {
  animation: TransitionAnim.PopIn,
  animationDuration: 250,
  initialComponent: null,
  initialComponentProps: {},
};


TransitionContainer.propTypes = {
  animation: React.PropTypes.oneOf(TransitionAnim.allVariants()),
  animationDuration: React.PropTypes.number,
  initialComponent: React.PropTypes.func,
  initialComponentProps: React.PropTypes.any,
};


module.exports = {
  TransitionContainer,
  TransitionAnim,
}
