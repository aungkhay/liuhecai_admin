export const formattedDate = (date) => {
    if (!date) return '选择日期'

    const d = new Date(date)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    const str = `${y}年${m}月${day}日`;
    return str;
}

export const orderZodiac = (currentId) => {
    const result = [];

    // currentId down to 1
    for (let i = currentId; i >= 1; i--) {
        result.push(i);
    }

    // 12 down to currentId + 1
    for (let i = 12; i > currentId; i--) {
        result.push(i);
    }

    return result;
}