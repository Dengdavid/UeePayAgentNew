<template>
	<div ref="echart" class="ui-echarts-box" :class="className" :id="id" :style="{height: height, width: width}"></div>
</template>

<script>
export default {
	name: 'EchartsBox',
	props: {
		className: {
			type: String,
			default: ""
		},
		id: {
			type: String,
			default: ""
		},
		width: {
			type: String,
			default: '100%'
		},
		height: {
			type: String,
			default: '100%'
		},
		autoResize: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			chart: null
		}
	},
	methods: {
		setOption(options) {
			options = options || {};
			// 设置字体样式
			/* if(!options.textStyle) {
				options.textStyle = {
					fontFamily: "'站酷庆科黄油体','serif','monospace','Arial','Courier New','Microsoft YaHei'"
				}
			} */
			if(!this.chart) {
				this.chart = this.$echarts.init(this.$refs.echart);
			}
			if(this.autoResize) {
				window.onresize = () => {
					if(this.chart) {
						this.chart.resize();
					}
				}
			}
			this.chart.setOption(options, true);
		}
	},
	beforeDestroy() {
    	if (!this.chart) {
    		return;
    	}
    	this.chart.dispose();
    	this.chart = null;
	}
}
</script>