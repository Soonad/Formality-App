const href = window.location.href;
const qidx = href.indexOf("?");
const file = qidx !== -1 ? href.slice(qidx+1) : "DemoApp@0";
const app_file = "App@7";

const {h, render} = require("preact");
const {useState, useEffect} = require("preact/hooks");
const fm = require("./../../formality");

const FormalityApp = (props) => {
  var [state, setState] = useState(null);
  var [funcs, setFuncs] = useState(null);

  var demo_state, demo_render, demo_update;

  useEffect(async () => {
    var loader = fm.forall.with_local_storage_cache(fm.forall.load_file);
    var {defs} = await fm.lang.parse("main", `import ${props.file}`, true, loader);

    var get_state = fm.to_js.compile(fm.lang.erase(defs[`${app_file}/get_state`]), {defs});
    var get_render = fm.to_js.compile(fm.lang.erase(defs[`${app_file}/get_render`]), {defs});
    var get_update = fm.to_js.compile(fm.lang.erase(defs[`${app_file}/get_update`]), {defs});
    var doc_to_json = fm.to_js.compile(fm.lang.erase(defs[`${app_file}/doc_to_json`]), {defs});
    //console.log("get_state", get_state);

    var app = fm.to_js.compile(fm.lang.erase(defs[`${props.file}/main`]), {defs});
    //console.log("app", app);
    var app_state = get_state(app);
    //console.log("app_state", app_state);
    var app_render = get_render(app);
    //console.log("app_render", app_render);
    var app_update = get_update(app);
    //console.log("app_update", app_update);

    setFuncs({state: app_state, render: app_render, update: app_update, doc_to_json});
    setState(app_state);
  }, [0]);

  const onClick = () => {
    setState(funcs.update(null, state));
  };

  if (state === null || funcs === null) {
    return h("div", {}, "(loading app...)");
  } else {
    //console.log("... state: ", state);
    //console.log("... native_render: ", funcs.render(state));
    //console.log("... native_json: ", funcs.doc_to_json(funcs.render(state)));
    //console.log("... json: ", fm.json.native_from(funcs.doc_to_json(funcs.render(state))));
    return h("div", {onClick}, render_doc(fm.json.native_from(funcs.doc_to_json(funcs.render(state)))));
  }
};

const render_doc = (doc) => {
  switch (doc.type) {
    case "text": return h("span", {}, doc.value);
    case "numb": return h("span", {}, String(doc.value));
    case "many": return doc.value.map(x => h("div", {}, render_doc(x)));
  }
};

window.onload = () => {
  render(h(FormalityApp, {file}), document.getElementById("main"));
};
