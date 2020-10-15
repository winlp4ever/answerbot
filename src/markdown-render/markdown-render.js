import React, { Component, useState, useEffect, useContext } from "react";
import { findDOMNode } from "react-dom";
import ReactMarkdown from "react-markdown";
import RemarkMathPlugin from "remark-math";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

import CodeBlock from "../syntax-highlight/syntax-highlight";
import './_markdown-render.scss';

const ProcessImage = (props) => {
	if (props.src.match(/^https*.*(png|jpg|jpeg)$/) != null) {
		return <img src={props.src} alt={props.alt}/>;
	}
	return null;
}

const ProcessLink = (props) => {
	if (props.href.match(/^https*/) != null) {
		return <a href={props.href} target='_blank'>{props.children}</a>;
	}
	if (props.children.length > 1) return null;
	return <span>{props.children}</span>;
}

class MdRender extends Component {
	state = {
		escapeHtml: true,
		plugins: [RemarkMathPlugin],
		
		renderers: {
			...this.props.renderers,
			code: CodeBlock,
			math: (props) => <BlockMath math={props.value} />,
			inlineMath: (props) => <InlineMath math={props.value} />,
			link: ProcessLink,
			linkReference: ProcessLink,
			image: ProcessImage
		},
	}

	async componentDidMount() {
		if (this.props.getOutline != null) {
			this.$content = $(findDOMNode(this.content));
		}
	}

	render() {
		let src = this.props.source
			.replace(/\.\.\.\n\[highlight\]/g, '...\n\n---')
			.replace(/\[\\highlight\]/g, '\n---')
			.replace(/\\+/g, '\\');
			//.replace(/(?<=_(.|\s)+)_(?=[a-z|0-9])/g, '_ ')
		return (
			<div className="markdown-render">
				<ReactMarkdown source={src} {...this.state} />
			</div>
		);
	}
}
// this is new
export default MdRender;
