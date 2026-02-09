<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
<script>
(() => {

  const showingAdmin = () => document.querySelector(".khFmcN") ? document.querySelector('input[name="show_all_servers"]').checked : false;
  const storageId = () => showingAdmin() ? 'admin_server_order' : 'server_order';
  const load = id => {
    let stored = localStorage.getItem(id);
    if (stored == undefined || stored.length === 0)
      return;

    sortable.sort(stored.split('|'));
  };
  const save = id => localStorage.setItem(id, sortable.toArray().filter(item => item.startsWith('/server/')).join('|'));
  const waitForElement = selector => new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });

  let sortable = null;

  new MutationObserver(mutations => {
    if (mutations[0].target.textContent !== 'Dashboard')
      return;

    if (document.querySelector(".khFmcN")) {
      let switchObserver = new MutationObserver(async mutations => {
        if ((await waitForElement('.HeRWk > a, .HeRWk > p')).nodeName === 'P')
          return;
        load(storageId());
      });

      switchObserver.observe(document.querySelector(".khFmcN"), {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    let observer = new MutationObserver(mutations => {
      let stop = true;
      for (const mutation of mutations)
        if (!mutation.target.classList.contains('jEGID')) {
          stop = false;
          break;
        }

      if (stop)
        return;

      observer.disconnect();
      sortable = Sortable.create(document.querySelector('.HeRWk'), {
        animation: 150,
        delay: (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) ? 100 : 0,
        handle: 'a',
        dataIdAttr: 'href',
        onMove: event => !event.related.classList.contains("jEGID") || event.willInsertAfter,
        onEnd: event => save(storageId())
      });
      load(storageId());
    });

    observer.observe(document.querySelector('.HeRWk'), {
      childList: true,
      subtree: true
    });
  }).observe(document.querySelector('title'), {
    childList: true,
    characterData: true,
    subtree: true
  });
})();
</script>
<style>
#app > div.App___StyledDiv-sc-2l91w7-0.fnfeQw > div.Fade__Container-sc-1p0gm8n-0.hcgQjy > section > div.ContentContainer-sc-x3r2dw-0.PageContentBlock___StyledContentContainer-sc-kbxq2g-0.jyeSuy.HeRWk.fade-appear-done.fade-enter-done > a {
  margin-top: 0.5rem;
}
</style>

