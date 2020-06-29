# 🔐 sig.tools

<h1 align="center" style="margin-top: 0px; margin-bottom: 0px; font-size: 60px">
  🔐
</h1>
<center>
  <h3 align="center"><a href="https://sig.tools">sig.tools</a></h3>

  <p align="center">
  <b><a href="https://sig.tools">sig.tools</a></b> is a tool to enable the distributed creation and (non-custodial) management of cryptographic accounts for the Ethereum Stack.
    <br />
    <a href="https://sig.tools">sig.tools</a>
    ·
    <a href="https://github.com/etclabscore/sig.tools/issues/new?assignees=&labels=&template=bug_report.md&title=">Report Bug</a>
    ·
    <a href="https://github.com/etclabscore/sig.tools/issues/new?assignees=&labels=&template=feature_request.md&title=">Request Feature</a>
  </p>
</center>
</h1>

<br />
<br />
<br />
<br />

🚧 <b>sig.tools</b> is in early development <b>alpha</b>. Some features are not available. This project has not been through an audit, use at your own risk, testnet usage is recommended. <a href="https://github.com/etclabscore/sig.tools/issues/new?assignees=&labels=&template=feature_request.md&title=">Give Feedback and Report Bugs</a>.

<br />
<br />
<br />
### Javascript/Typescript SDK
You can interact with `sig.tools` via `PostMessage` over `JSON-RPC`. There is a generated sdk from this repository you can install:

```
npm install --save sig.tools-sdk
```

and use in your dapp:

```
import SigtoolsSDK from "sig.tools-sdk";

const sigtoolsSDK = new SigtoolsClient({
  transport: {
    type: "postmessagewindow",
    host: "sig.tools",
    port: 443,
    protocol: "https",
  },
});

const signedResult = await sigtoolsSDK.sign(hexString, address, chainId);
console.log(signedResult);
```

### Contributing

How to contribute, build and release are outlined in [CONTRIBUTING.md](CONTRIBUTING.md), [BUILDING.md](BUILDING.md) and [RELEASING.md](RELEASING.md) respectively. Commits in this repository follow the [CONVENTIONAL_COMMITS.md](CONVENTIONAL_COMMITS.md) specification.


# Resources

- [When absolutely no one can steal or return lost Ethereum Classic funds](https://ethereumclassic.org/blog/2017-06-17-private-keys) - **2017/06/16 Christian Seberino**
