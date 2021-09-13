import PropTypes from "prop-types";
import React from "react";
import { Linking, StyleSheet, View, Text } from "react-native";
import ParsedText from "react-native-parsed-text";
import Communications from "react-native-communications";
import { StylePropType } from "./utils";
import Color from './Color'

const WWW_URL_PATTERN = /^www\./i;
const textStyle = {
    fontSize: 16,
    lineHeight: 20,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 10,
    marginRight: 10,
};
const styles = {
    left: StyleSheet.create({
        container: { flexDirection: "row", alignItems: "center" },
        text: {
            color: "black",
            ...textStyle,
        },
        link: {
            color: "black",
            textDecorationLine: "underline",
        },
        replierName: {
            marginLeft: 10,
            color: Color.primary,
            fontWeight: "600",
        },
    }),
    right: StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
        },
        text: {
            color: "white",
            ...textStyle,
        },
        link: {
            color: "white",
            textDecorationLine: "underline",
        },
        replierName: {
            marginLeft: 10,
            color: Color.primary,
            fontWeight: "600",
        },
    }),
};
const DEFAULT_OPTION_TITLES = ["Call", "Text", "Cancel"];
export default class MessageText extends React.Component {
    constructor() {
        super(...arguments);
        this.onUrlPress = (url) => {
            // When someone sends a message that includes a website address beginning with "www." (omitting the scheme),
            // react-native-parsed-text recognizes it as a valid url, but Linking fails to open due to the missing scheme.
            if (WWW_URL_PATTERN.test(url)) {
                this.onUrlPress(`http://${url}`);
            } else {
                Linking.canOpenURL(url).then(supported => {
                    if (!supported) {
                        console.error('No handler for URL:', url);
                    }
                    else {
                        Linking.openURL(url);
                    }
                });
            }
        };
        this.onPhonePress = (phone) => {
            const { optionTitles } = this.props;
            const options =
              optionTitles && optionTitles.length > 0
                ? optionTitles.slice(0, 3)
                : DEFAULT_OPTION_TITLES;
            const cancelButtonIndex = options.length - 1;
            this.context.actionSheet().showActionSheetWithOptions(
              {
                  options,
                  cancelButtonIndex,
              },
              (buttonIndex) => {
                  switch (buttonIndex) {
                      case 0:
                          Communications.phonecall(phone, true);
                          break;
                      case 1:
                          Communications.text(phone);
                          break;
                      default:
                          break;
                  }
              }
            );
        };
        this.onEmailPress = (email) =>
          Communications.email([email], null, null, null, null);
    }

    shouldComponentUpdate(nextProps) {
        return (
          !!this.props.currentMessage &&
          !!nextProps.currentMessage &&
          this.props.currentMessage.text !== nextProps.currentMessage.text
        );
    }
    render() {
        const { isReply, replyName } = this.props;
        const linkStyle = [
            styles[this.props.position].link,
            this.props.linkStyle && this.props.linkStyle[this.props.position],
        ];
        return (
          <View
            style={[
                styles[this.props.position].container,
                this.props.containerStyle &&
                this.props.containerStyle[this.props.position],
            ]}
          >
              {isReply && (
                <Text style={styles[this.props.position].replierName}>
                    {replyName} —{" "}
                </Text>
              )}
              <ParsedText
                style={[
                    styles[this.props.position].text,
                    this.props.textStyle && this.props.textStyle[this.props.position],
                    this.props.customTextStyle,
                ]}
                parse={[
                    ...this.props.parsePatterns(linkStyle),
                    { type: "url", style: linkStyle, onPress: this.onUrlPress },
                    { type: "phone", style: linkStyle, onPress: this.onPhonePress },
                    { type: "email", style: linkStyle, onPress: this.onEmailPress },
                ]}
                childrenProps={{ ...this.props.textProps }}
              >
                  {this.props.currentMessage.text}
              </ParsedText>
          </View>
        );
    }
}
MessageText.contextTypes = {
    actionSheet: PropTypes.func,
};
MessageText.defaultProps = {
    position: "left",
    optionTitles: DEFAULT_OPTION_TITLES,
    currentMessage: {
        text: "",
    },
    containerStyle: {},
    textStyle: {},
    linkStyle: {},
    customTextStyle: {},
    textProps: {},
    parsePatterns: () => [],
};
MessageText.propTypes = {
    position: PropTypes.oneOf(["left", "right"]),
    optionTitles: PropTypes.arrayOf(PropTypes.string),
    currentMessage: PropTypes.object,
    containerStyle: PropTypes.shape({
        left: StylePropType,
        right: StylePropType,
    }),
    textStyle: PropTypes.shape({
        left: StylePropType,
        right: StylePropType,
    }),
    linkStyle: PropTypes.shape({
        left: StylePropType,
        right: StylePropType,
    }),
    parsePatterns: PropTypes.func,
    textProps: PropTypes.object,
    customTextStyle: StylePropType,
};
//# sourceMappingURL=MessageText.js.map
