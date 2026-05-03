import { useUserStore } from "../stores/user"
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export const formattedDate = (date) => {
    if (!date) return ''

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

export const combinations = (arr, k) => {
    const result = [];

    function backtrack(start, combo) {
        if (combo.length === k) {
            result.push([...combo]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            combo.push(arr[i]);      // strings are fine
            backtrack(i + 1, combo);
            combo.pop();
        }
    }

    backtrack(0, []);
    return result;
}

export const checkPermission = (perm) => {
    const userStore = useUserStore();
    const isSuperAdmin = userStore.isSuperAdmin;
    const permissions = userStore.permissions;

    return isSuperAdmin || permissions.includes(perm);
}

export const exportExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${filename}.xlsx`);
}