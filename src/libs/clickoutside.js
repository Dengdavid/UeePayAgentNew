export default {
    created (el, binding, vnode) {
        function documentHandler (e) {
            if (el.contains(e.target)) {
                return false;
            }
            if (binding.value) {
                binding.value(e);
            }
        }
        el.__vueClickOutside__ = documentHandler;
        document.addEventListener('click', documentHandler);
    },
    update () {

    },
    unmounted (el, binding) {
        document.removeEventListener('click', el.__vueClickOutside__);
        delete el.__vueClickOutside__;
    }
};