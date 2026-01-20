<template>
    <div class="i_canvas">
        <canvas id="canvas" :width="contentWidth" :height="contentHeight" class="rounded-lg"></canvas>
    </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';

const props = defineProps({
    identifyCode: {
        type: String,
        default: "AA0000"
    },
    fontSizeMin: {
        type: Number,
        default: 28
    },
    fontSizeMax: {
        type: Number,
        default: 40
    },
    backgroundColorMin: {
        type: Number,
        default: 180
    },
    backgroundColorMax: {
        type: Number,
        default: 240
    },
    colorMin: {
        type: Number,
        default: 50
    },
    colorMax: {
        type: Number,
        default: 160
    },
    lineColorMin: {
        type: Number,
        default: 100
    },
    lineColorMax: {
        type: Number,
        default: 200
    },
    dotColorMin: {
        type: Number,
        default: 0
    },
    dotColorMax: {
        type: Number,
        default: 255
    },
    contentWidth: {
        type: Number,
        default: 120
    },
    contentHeight: {
        type: Number,
        default: 54
    }
})

const randomNum = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
}
const randomColor = (min, max) => {
    var r = randomNum(min, max);
    var g = randomNum(min, max);
    var b = randomNum(min, max);
    return "rgb(" + r + "," + g + "," + b + ")";
}
const drawPic = () => {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    ctx.textBaseline = "bottom";
    // 绘制背景
    ctx.fillStyle = randomColor(
        props.backgroundColorMin,
        props.backgroundColorMax
    );
    ctx.fillRect(0, 0, props.contentWidth, props.contentHeight);
    // 绘制文字
    for (let i = 0; i < props.identifyCode.length; i++) {
        drawText(ctx, props.identifyCode[i], i);
    }
    drawLine(ctx);
    drawDot(ctx);
}
const drawText = (ctx, txt, i) => {
    ctx.fillStyle = randomColor(props.colorMin, props.colorMax);
    ctx.font = randomNum(props.fontSizeMin, props.fontSizeMax) + "px SimHei";

    var x = (i + 1) * (props.contentWidth / (props.identifyCode.length + 1));
    var y = randomNum(props.fontSizeMax, props.contentHeight - 5);
    var deg = randomNum(-30, 30);
    // 修改坐标原点和旋转角度
    ctx.translate(x, y);
    ctx.rotate((deg * Math.PI) / 270);
    ctx.fillText(txt, 0, 0);
    // 恢复坐标原点和旋转角度
    ctx.rotate((-deg * Math.PI) / 270);
    ctx.translate(-x, -y);
}
const drawDot = (ctx) => {
    // 绘制干扰点
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = randomColor(0, 255);
        ctx.beginPath();
        ctx.arc(
            randomNum(0, props.contentWidth),
            randomNum(0, props.contentHeight),
            1,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }
}
const drawLine = (ctx) => {
    // 绘制干扰线
    for (let i = 0; i < 8; i++) {
        ctx.strokeStyle = randomColor(
            props.lineColorMin,
            props.lineColorMax
        );
        ctx.beginPath();
        ctx.moveTo(
            randomNum(0, props.contentWidth),
            randomNum(0, props.contentHeight)
        );
        ctx.lineTo(
            randomNum(0, props.contentWidth),
            randomNum(0, props.contentHeight)
        );
        ctx.stroke();
    }
}

watch(
    () => props.identifyCode,
    () => {
        drawPic();
    }
)

onMounted(() => {
    drawPic();
})
</script>

<style scoped>
    .i_canvas {
        height: 40px;
    }
</style>