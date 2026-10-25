/**
 * Corre antes de pintar: pone el tema guardado (oscuro por defecto) y la
 * clase `js` que permite animar entradas. Con "reducir movimiento" quita las
 * transiciones de página del navegador. Si la app no llega a montar en 3s,
 * muestra todo para que nada se quede escondido.
 */
const script = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('atendel-tema');d.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}document.documentElement.classList.add('js');try{if(matchMedia('(prefers-reduced-motion: reduce)').matches){delete Document.prototype.startViewTransition;}}catch(e){}setTimeout(function(){if(!window.__atendelReady){document.documentElement.classList.add('reveal-all');}},3000);})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
