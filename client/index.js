import { fetchEarthquakes } from './lib/earthquakes';
import { el, element, formatDate } from './lib/utils';
import { init, createPopup } from './lib/map';

document.addEventListener('DOMContentLoaded', async () => {
  // TODO
  // Bæta við virkni til að sækja úr lista
  // Nota proxy
  // Hreinsa header og upplýsingar þegar ný gögn eru sótt
  // Sterkur leikur að refactora úr virkni fyrir event handler í sér fall
  let url = document.URL;
  let earthquakes;
  let query;
  let ekki = '';
  let strE = '';
  if(url) {
    query = url.split('?')[1];
  }
  if(query) {
    const loading = document.querySelector('.loading');
    const period = query.split('&')[0].split('=')[1];
    const type = query.split('&')[1].split('=')[1];
    const result = await fetchEarthquakes(type, period);
    const data = result.text;
    const cached = result.info.cached;
    const elapsed = result.info.elapsed;
    const parent = loading.parentNode;
    parent.removeChild(loading);
    earthquakes = data.features;
    strE = String(elapsed);
    if(cached == false){
      ekki = 'ekki';
    };
  }
  // Fjarlægjum loading skilaboð eftir að við höfum sótt gögn

  if (!earthquakes) {
    parent.appendChild(
      el('p', 'Villa við að sækja gögn'),
    );
  }

  const ul = document.querySelector('.earthquakes');
  const map = document.querySelector('.map');

  init(map);

  
  const list = el('li');

  list.appendChild(
    el('div',
      el('h1', 'Gögn eru ', ekki, ' í cache. Fyrirspurn tók ', strE, ' sek.'),
    ),
  );

  ul.appendChild(list);

  earthquakes.forEach((quake) => {
    const {
      title, mag, time, url,
    } = quake.properties;

    const link = element('a', { href: url, target: '_blank' }, null, 'Skoða nánar');

    const markerContent = el('div',
      el('h3', title),
      el('p', formatDate(time)),
      el('p', link));
    const marker = createPopup(quake.geometry, markerContent.outerHTML);

    const onClick = () => {
      marker.openPopup();
    };

    const li = el('li');

    li.appendChild(
      el('div',
        el('h2', title),
        el('dl',
          el('dt', 'Tími'),
          el('dd', formatDate(time)),
          el('dt', 'Styrkur'),
          el('dd', `${mag} á richter`),
          el('dt', 'Nánar'),
          el('dd', url.toString())),
        element('div', { class: 'buttons' }, null,
          element('button', null, { click: onClick }, 'Sjá á korti'),
          link)),
    );

    ul.appendChild(li);
  });
});
