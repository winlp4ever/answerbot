import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { shadesOfPurple } from 'react-syntax-highlighter/dist/esm/styles/hljs';

class CodeBlock extends PureComponent {
    static propTypes = {
        value: PropTypes.string.isRequired,
        language: PropTypes.string
    };
  
    static defaultProps = {
        language: 'js',
        value: 'type code here'
    };
  
    render() {
        const language = (this.props.language) ? this.props.language: 'js';
        const value = (this.props.value) ? this.props.value: '';
        return (
            <SyntaxHighlighter language={language} style={shadesOfPurple}>
                {value}
            </SyntaxHighlighter>
        );
    }
}
  
export default CodeBlock;