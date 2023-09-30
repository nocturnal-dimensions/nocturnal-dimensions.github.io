function register_mathjax_ref(o){
	(o instanceof $ ? o.find('.MathJax_ref') : $('.MathJax_ref')).click(scroll_register);
}
window.MathJax = {
	CommonHTML: { linebreaks: { automatic: true}, mtextFontInherit: true },
	"HTML-CSS": { fonts: ["TeX"], mtextFontInherit: true, linebreaks: {automatic: true} },
	displayAlign: "left",
	displayIndent: "0px",
	TeX: {
		equationNumbers: { autoNumber: "AMS", useLabelIds: false, formatURL: function (id,base) {return ""} },
		Macros: {
			co : ['{\\color{rgb(243,165,25)} #1}', 1],
			cr : ['{\\color{rgb(222,49,49)} #1}', 1],
			cb : ['{\\color{rgb(56,103,205)} #1}', 1],
			cp : ['{\\color{rgb(185,94,207)} #1}', 1],
			cbr : ['{\\color{rgb(244,131,133)} #1}', 1],
			cbg : ['{\\color{rgb(80,237,170)} #1}', 1],
			cby : ['{\\color{rgb(243,232,101)} #1}', 1],
	}},
	tex2jax: { preview: "none"},
	elements: ['cbox'],
	showMathMenu: false,
	showProcessingMessages: false,
	messageStyle: "none",
	"fast-preview": {
		disabled: false
	},
	AuthorInit: function () {
		MathJax.Hub.Register.StartupHook("End Typeset",register_mathjax_ref);
	}
};