import { split } from 'sentence-splitter';
import * as htmlparser2 from 'htmlparser2';
import render from 'dom-serializer';

import basicRandomID from './basicRandomID';
import { getChildren, replaceElement } from 'domutils';

function splitSentences(text) {
  // const removed = "’ " //l'heure [french]
  const quotation = `“ ” ‘ « » „ ” “ ❞ ❝ ❛ ❜「 」『 』„ ” << >> ＂`;
  const punctuation = `( ) { } [ ] ! ? ؟ ¿ . , – : ; ⁏ & ¡ ，。、`;

  const chars = [...quotation.split(' '), ...punctuation.split(' ')];

  const options = {
    SeparatorParser: {
      separatorCharacters: chars,
    },
  };

  let splitText = split(String(text), options);
  return splitText.map((s) => s.raw);
}

//Unused
function findDomNodeInTree(rootA, rootB, targetNode) {
  //weaker condition
  // if (rootA.innerHTML == targetNode.innerHTML) {
  if (rootA.innerHTML === targetNode.innerHTML) {
    return rootB;
  }

  let nodeB = null;

  for (let i = 0; i < rootA.childNodes.length && nodeB === null; i++) {
    nodeB = findDomNodeInTree(
      rootA.childNodes[i],
      rootB.childNodes[i],
      targetNode
    );
  }

  return nodeB;
}

function findParallelText(elem, root) {
  if (!elem.dataset?.pll) {
    elem = elem.closest('[data-pll]');
  }

  return root.querySelector(`[data-pll='${elem.dataset.pll}']`);
}

function parseAndSplit(htmlstring) {
  // ----------------------------
  // add classes and dataset info to be read by later components (for adding event handlers):
  //  pll-sentence (and data-pll) for parallel highlights
  //  pll-scroll-anchor (and data-pll) for syncronised scrolling

  // ----------------------------
  function replacer(root) {
    let children = getChildren(root);
    children.length &&
      children.forEach((node) => {
        if (node.type === 'tag') {
          const { name } = node;
          if (name === 'p') {
            manipulatePTags(node);
          }
        }
        //stop recursion
        if (node.type === 'text') {
          replaceTextNodes(node);
          return;
        }
        // recurse
        replacer(node);
      });
    return root;
  }

  // Adds class="pll-sentence" and unique data-pll attribute idto each text node
  function replaceTextNodes(node) {
    if (node.type === 'text') {
      let fragments = splitSentences(node.nodeValue);
      let html = '';
      fragments.forEach((frag) => {
        let datapll = basicRandomID();
        if (frag.length > 0) {
          //see comment below
          html = html.concat(
            `<span class="pll-sentence" data-pll=${datapll}>${frag}</span>`
          );
        } else {
          //Unused section:  (frag.length always > 0); We need every fragment to have a data-pll for
          //findparalleltext function to work correctly (when called from textselectionhandler)
          // html = html.concat(`${frag}`);
        }
      });

      html = `<span>${html}</span>`; //??spans?

      var domHandler = new htmlparser2.DomHandler(function (err, elems) {
        replaceElement(node, elems[0]);
      });
      var parser = new htmlparser2.Parser(domHandler);
      parser.write(html);
      parser.end();
    }
  }

  function manipulatePTags(node) {
    if (node.name === 'p') {
      let datascroll = basicRandomID();
      addDataset(node, 'data-pll', datascroll);
      addClasses(node, ['pll-scroll-anchor']);
    }
  }

  // Helpers
  function addClasses(node, classes) {
    let classList = node.attribs?.class || '';
    classList = classList.concat(' ', classes.join(' '));
    node.attribs.class = classList;
    replaceElement(node, node);
  }

  function addDataset(node, data, val) {
    node.attribs[`${data}`] = val;
    replaceElement(node, node);
  }

  // ------------------------------------

  const dom = htmlparser2.parseDocument(htmlstring.trim());
  let replaceddom = replacer(dom);
  let html = render(replaceddom);
  return html;
}

function scrollThruElement(el, scrollCont = window, int = 100, cb) {
  // ------------------------------------
  // NOTE: currently some hardcoded stuff that might want to be dynamic?
  // ------------------------------------

  let interval;
  let sh = el.scrollHeight;
  let incr = el.getBoundingClientRect().height;
  let scrollY = 0;
  interval = setInterval(function () {
    scrollCont.scrollTo({ top: scrollY });
    scrollY += incr;

    if (scrollY >= sh + incr) {
      clearInterval(interval);
      cb();
    }
  }, int);
}

export {
  findDomNodeInTree,
  findParallelText,
  splitSentences,
  parseAndSplit,
  scrollThruElement,
};
