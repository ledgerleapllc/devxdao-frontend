/* eslint-disable react/no-unknown-property */
import React, { Component } from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import Head from "next/head";
import { GlobalLayout } from "../layouts";
import { Routes } from "../routes";
import { BRAND } from "../utils/Constant";
import Helper from "../utils/Helper";
import { setTheme } from "../redux/actions";

const mapStateToProps = (state) => {
  return {
    sidebarShown: state.global.sidebarShown,
    theme: state.global.theme,
  };
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      shouldRefresh: false,
      id: null,
    };
  }

  componentDidMount() {
    const theme = Helper.getTheme();
    this.props.dispatch(setTheme(theme));
    const id = setTimeout(
      () => this.setState({ shouldRefresh: true }),
      1000 * 60 * 60 * 6
    );
    this.setState({ id });
  }

  componentWillUnmount() {
    clearTimeout(this.state.id);
  }

  render() {
    const { sidebarShown, theme } = this.props;
    let className = sidebarShown ? "app app-sidebar-open" : "app";
    className += ` theme-${theme}`;

    return (
      <div className={className}>
        <Head>
          <title>{BRAND}</title>
          <meta
            name="viewport"
            content="width=device-width, minimum-scale=1.0, maximum-scale = 1.0, user-scalable = no"
          />
          <link
            rel="preload"
            href="/fonts/metropolis/Metropolis-ExtraLightItalic.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/metropolis/Metropolis-RegularItalic.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/metropolis/Metropolis-SemiBoldItalic.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/metropolis/Metropolis-BlackItalic.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/metropolis/Metropolis-ThinItalic.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/metropolis/Metropolis-SemiBold.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/metropolis/Metropolis-MediumItalic.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/metropolis/Metropolis-LightItalic.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/metropolis/Metropolis-Light.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/metropolis/Metropolis-Black.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/metropolis/Metropolis-Thin.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/metropolis/Metropolis-ExtraLight.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/metropolis/Metropolis-Bold.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/metropolis/Metropolis-Regular.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/metropolis/Metropolis-BoldItalic.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-0RQ9PF59K5"
          ></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0RQ9PF59K5');
              `,
            }}
          />
        </Head>
        <Router forceRefresh={this.state.shouldRefresh}>
          <GlobalLayout />
          <Routes />
        </Router>
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
