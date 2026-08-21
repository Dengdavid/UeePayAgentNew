<template>
    <Form ref="formRef" :model="form" :rules="rules" :label-position="labelPosition">
        <Row :gutter="10">
            <Col :span="span" v-for="item in fieldList" :key="item.name" v-show="!item.hidden">
                <FormItem :key="item.name" :prop="item.name" :label="item.title" :class="{ 'form-item-error': isFieldError(item.name) }">
                    <template #label>
                        <div class="ui-render-label">
                            <span class="text">{{ item.title }}</span>
                            
                            <Tooltip v-if="item.description" :content="item.description" placement="right">
                                <Icon type="ios-help-circle-outline" size="16" class="help-icon" />
                            </Tooltip>
                        </div>
                    </template>
                    <div class="ui-render-input">
                        <component 
                            :is="formMaps[item.type]" 
                            :params="item"
                            v-model="form[item.name]"
                            @on-change="handleComponentUpdate(item.name, $event)"
                            @on-focus="handleComponentFocus(item.name)"
                            :class="{ 'input-error': isFieldError(item.name) }"
                        ></component>
                        <div v-if="item.actions" class="ui-render-actions">
                            <a v-for="(action, index) in item.actions" :key="index" @click="handleClickAction(item.name, index)">{{ action }}</a>
                        </div>
                    </div>
                </FormItem>
            </Col>
        </Row>
    </Form>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import RenderItem from '@/components/render/index.vue'
import FormInput from '@/components/render/form/input.vue'
import FormSelect from '@/components/render/form/select.vue'
import FormRadio from '@/components/render/form/radio.vue'
import FormCheckbox from '@/components/render/form/checkbox.vue'
import FormDate from '@/components/render/form/date.vue'
import ComplianceUpload from '@/components/render/form/compliance-upload.vue'

const props = defineProps({
    fields: {
        type: Array,
        default: function() {
            return []
        }
    },
    storage: {
        type: String,
        default: ''
    },
    span: {
        type: Number,
        default: 24
    },
    labelPosition: {
        type: String,
        default: 'top'
    },
    noShowItem: {
        type: Array,
        default: function() {
            return []
        }
    },
    errorFields: {
        type: Array,
        default: function() {
            return []
        }
    }
})

const emit = defineEmits(['on-action', 'on-field-change', 'on-form-change', 'on-field-focus'])

const formMaps = {
    'input': FormInput,
    'select': FormSelect,
    'radio': FormRadio,
    'cehcekbox': FormCheckbox,
    'date': FormDate,
    // 'file': ImageUpload,
    'file': ComplianceUpload
}

const formRef = ref()
const form = ref({})
const rules = ref({})
const fieldList = ref([])

const handleComponentUpdate = (fieldName, value) => {
    /* // 使用 nextTick 确保值更新后再触发事件
    nextTick(() => {
        // 触发整个表单变化事件
        const formData = { ...form.value };
        emit('on-form-change', formData);
    });*/
    // 触发字段变化事件
    emit('on-field-change', fieldName, value);
    // 缓存表单
    if(props.storage) {
        // 确保文件上传字段的值被正确缓存（包括url和fileId）
        const formToCache = { ...form.value };
        localStorage.setItem(props.storage, JSON.stringify(formToCache));
    }
    
    // 如果字段值发生变化，重新验证该字段，清除错误状态
    if (formRef.value && fieldName) {
        // 使用nextTick确保值更新后再验证
        nextTick(() => {
            // 仅验证当前字段
            formRef.value.validateField(fieldName);
            
            // 触发field-change事件，通知父组件可能需要更新错误状态
            emit('on-field-change', fieldName, value, true); // 第三个参数表示字段已验证
        });
    }
    
    // 处理身份证类型变化
    if (fieldName === 'receiverIdType' || fieldName === 'senderIdType') {
        handleIdTypeChange(fieldName, value);
    }
}

// 处理身份证类型变化
const handleIdTypeChange = (fieldName, value) => {
    const prefix = fieldName.replace('IdType', ''); // receiver 或 sender
    // 隐藏所有相关上传字段
    fieldList.value.forEach(field => {
        if (field.name.startsWith(`${prefix}Passport`) || 
            field.name.startsWith(`${prefix}Ic`) || 
            field.name.startsWith(`${prefix}IcFront`) || 
            field.name.startsWith(`${prefix}IcBack`) ||
            field.name.startsWith(`${prefix}CompanyRegisterDocument`) ||
            field.name.startsWith(`${prefix}Others`) ||
            field.name.startsWith(`${prefix}WorkPermit`)) {
            field.hidden = true;
        }
    });

    // 将value转换为数字类型
    const numValue = Number(value);
    
    // 根据选择的类型显示相应字段
    switch (numValue) {
        case 1: // 护照
            ensureField(`${prefix}Passport`, `护照`, `请上传护照`, "file", prefix, 98);
            showField(`${prefix}Passport`, false);
            break;
        case 2: // 身份证
            ensureField(`${prefix}IcFront`, `身份证正面`, `请上传身份证正面`, "file", prefix, 99);
            ensureField(`${prefix}IcBack`, `身份证反面`, `请上传身份证反面`, "file", prefix, 100);
            showField(`${prefix}IcFront`, false);
            showField(`${prefix}IcBack`, false);
            break;
        case 3: // 公司注册文件
            ensureField(`${prefix}CompanyRegisterDocument`, `公司注册文件`, `请上传公司注册文件`, "file", prefix, 101);
            showField(`${prefix}CompanyRegisterDocument`, false);
            break;
        case 4: // 其它
            ensureField(`${prefix}Others`, `其它证件`, `请上传其它证件`, "file", prefix, 102);
            showField(`${prefix}Others`, false);
            break;
        case 5: // 工作证明
            ensureField(`${prefix}WorkPermit`, `工作证明`, `请上传工作证明`, "file", prefix, 103);
            showField(`${prefix}WorkPermit`, false);
            break;
        default:
            break;
    }
}

// 确保字段存在，如果不存在则创建
const ensureField = (fieldName, fieldTitle, fieldDescription, fieldType, userType, sorting) => {
    // 检查字段是否已存在
    const fieldExists = fieldList.value.some(item => item.name === fieldName);

    // 如果字段不存在，创建并添加到fieldList中
    if (!fieldExists) {
        const newField = {
            name: fieldName,
            fieldName: fieldName,
            type: fieldType,
            title: fieldTitle,
            description: fieldDescription,
            fieldUserType: userType,
            required: true,
            sorting: sorting,
            hidden: true, // 默认隐藏，后续会根据需要显示
            showHelp: true
        };
        
        fieldList.value.push(newField);
        
        // 在form中初始化该字段的值
        // 检查缓存中是否有该字段的值
        let cachedValue = '';
        if (props.storage) {
            try {
                const storageData = localStorage.getItem(props.storage);
                if (typeof storageData === 'string') {
                    const parsedData = JSON.parse(storageData);
                    if (parsedData && parsedData[fieldName]) {
                        cachedValue = parsedData[fieldName];
                    }
                }
            } catch (e) {
            }
        }

        // 使用缓存值或默认空值
        form.value[fieldName] = cachedValue || '';

        // 添加验证规则
        if (!rules.value[fieldName]) {
            rules.value[fieldName] = [{
                required: true,
                message: `请上传${fieldTitle}`,
                trigger: 'change',
                validator: (rule, value, callback) => {
                    // 如果字段是隐藏的，跳过验证
                    const field = fieldList.value.find(f => f.name === fieldName);
                    if (field && field.hidden) {
                        callback();
                        return;
                    }
                    
                    if (!value || !value.url) {
                        callback(new Error(`请上传${fieldTitle}`));
                        return;
                    }
                    callback();
                }
            }];
        }
    }
}

// 显示或隐藏字段
const showField = (fieldName, hidden = false) => {
    const field = fieldList.value.find(item => item.name === fieldName);
    if (field) {
        field.hidden = hidden;
        // 如果字段被隐藏，且是必填字段，重置其值
        if (hidden && field.required) {
            form.value[fieldName] = '';
        }
    }
}

watch(() => props.fields, (newFields) => {
    init()
}, { deep: true});

const init = async function() {
    // 重置數據
    form.value = {};
    rules.value = {};
    fieldList.value = [];

    await nextTick()

    // 格式化表單
    const fields = props.fields;
    
    // 初始化 fieldList
    fieldList.value = fields.map(item => {
        // 如果 noShowItem 包含 item.fieldName，则不显示
        if(props.noShowItem.includes(item.fieldName)) {
            item.hidden = true
        }
        // 确保保留原始value值
        const fieldValue = item.value !== undefined ? item.value : undefined;
        
        return {
            name: item.fieldName,
            fieldName: item.fieldName,
            type: item.fieldType,
            title: item.fieldTitle,
            description: item.fieldDescription,
            options: item.selectValues,
            actions: item.actions,
            showHelp: true,
            value: fieldValue, // 使用保存的value值
            hidden: item.hidden,
            disabled: item.disabled,
            required: item.required,
            regex: item.regex,
            min: item.min,
            max: item.max
        };
    });

    // 初始化表单值和验证规则
    const initialForm = {};
    const validationRules = {};
    
    let values = {};
    if(props.storage) {
        try {
            const storages = localStorage.getItem(props.storage);
            if(typeof storages === 'string') {
                values = JSON.parse(storages);
            }
        } catch (e) {
            // 获取缓存失败
        }
    }

    fields.forEach(item => {
        // 保存原始value值
        const defaultValue = item.value !== undefined ? item.value : (item.fieldType === 'checkbox' ? [] : '');
        
        // 设置初始值
        initialForm[item.fieldName] = defaultValue;

        // 填充缓存的值
        if(props.storage && values[item.fieldName] !== undefined) {
            // 检查是否为'undefined'字符串
            if(values[item.fieldName] === 'undefined') {
                initialForm[item.fieldName] = '';
            } else {
                initialForm[item.fieldName] = values[item.fieldName];
            }
        }
        
        // 更新fieldList中的值，确保与form一致
        const field = fieldList.value.find(f => f.name === item.fieldName);
        if(field) {
            field.value = initialForm[item.fieldName];
        }
        
        // 构建验证规则
        const rules = [];
        
        // 必填验证
        if (item.required) {
            const message = (() => {
                switch (item.fieldType) {
                    case 'select':
                        return `请选择${item.fieldTitle}`;
                    case 'file':
                        return `请上传${item.fieldTitle}`;
                    case 'checkbox':
                        return `请选择${item.fieldTitle}`;
                    case 'date':
                        return `请选择${item.fieldTitle}`;
                    default:
                        return `请输入${item.fieldTitle}`;
                }
            })();

            rules.push({
                required: true,
                message,
                trigger: ['input', 'textarea'].indexOf(item.fieldType) !== -1 ? 'blur' : 'change',
                validator: (rule, value, callback) => {
                    // 如果值是字符串"undefined"，视为无效
                    if (value === 'undefined') {
                        value = '';
                    }
                    // 文件类型验证
                    if (item.fieldType === 'file') {
                        // 如果字段隐藏，跳过验证
                        const field = fieldList.value.find(f => f.name === item.fieldName);
                        if (field && field.hidden) {
                            callback();
                            return;
                        }
                        
                        if (!value || !value.url) {
                            callback(new Error(`请上传${item.fieldTitle}`));
                            return;
                        }
                    } 
                    // 复选框类型验证
                    else if (item.fieldType === 'checkbox') {
                        if (!Array.isArray(value) || value.length === 0) {
                            callback(new Error(`请选择${item.fieldTitle}`));
                            return;
                        }
                    } 
                    // 日期类型验证
                    else if (item.fieldType === 'date') {
                        if (value === undefined || value === null || value === '') {
                            callback(new Error(`请选择${item.fieldTitle}`));
                            return;
                        }
                    }
                    // 其他类型验证
                    else if (value === undefined || value === null || value === '') {
                        callback(new Error(`请输入${item.fieldTitle}`));
                        return;
                    }

                    // 长度验证（如果有 min 或 max）
                    if (item.min !== undefined || item.max !== undefined) {
                        const length = String(value).length;
                        if (item.min !== undefined && length < item.min) {
                            callback(new Error(`${item.fieldTitle}长度不能小于${item.min}个字符`));
                            return;
                        }
                        if (item.max !== undefined && length > item.max) {
                            callback(new Error(`${item.fieldTitle}长度不能超过${item.max}个字符`));
                            return;
                        }
                    }

                    callback();
                }
            });
        }

        // 正则验证
        if (item.regex) {
            rules.push({
                pattern: new RegExp(item.regex),
                message: `请输入有效的${item.fieldTitle}`,
                trigger: ['input', 'textarea'].indexOf(item.fieldType) !== -1 ? 'blur' : 'change',
                validator: (rule, value, callback) => {
                    // 如果值为空且不是必填，则跳过验证
                    if (!item.required && (value === undefined || value === null || value === '')) {
                        callback();
                        return;
                    }

                    // 如果值为空且是必填，则返回必填错误
                    if (item.required && (value === undefined || value === null || value === '')) {
                        callback(new Error(`请输入${item.fieldTitle}`));
                        return;
                    }

                    // 使用正则表达式验证
                    const regex = new RegExp(item.regex);
                    if (!regex.test(value)) {
                        callback(new Error(`请输入有效的${item.fieldTitle}`));
                        return;
                    }
                    callback();
                }
            });
        }

        // 添加验证规则
        if (rules.length > 0) {
            validationRules[item.fieldName] = rules;
        }
    });

    // 更新表单值和验证规则
    form.value = initialForm;
    rules.value = validationRules;
    
    // 初始化完成后，处理ID类型的默认显示
    await nextTick();
    
    // 查找并处理receiverIdType和senderIdType的初始值
    if (form.value.receiverIdType) {
        handleIdTypeChange('receiverIdType', form.value.receiverIdType);
    } else {
        // 如果没有初始值，尝试获取该字段的第一个选项值
        const receiverIdTypeField = fieldList.value.find(item => item.name === 'receiverIdType');
        if (receiverIdTypeField && receiverIdTypeField.options && receiverIdTypeField.options.length > 0) {
            const defaultValue = receiverIdTypeField.options[0].value;
            form.value.receiverIdType = defaultValue;
        }
    }
    
    if (form.value.senderIdType) {
        handleIdTypeChange('senderIdType', form.value.senderIdType);
    } else {
        // 如果没有初始值，尝试获取该字段的第一个选项值
        const senderIdTypeField = fieldList.value.find(item => item.name === 'senderIdType');
        if (senderIdTypeField && senderIdTypeField.options && senderIdTypeField.options.length > 0) {
            const defaultValue = senderIdTypeField.options[0].value;
            form.value.senderIdType = defaultValue;
            handleIdTypeChange('senderIdType', defaultValue);
        }
    }
    
    // 恢复缓存中的动态字段
    await nextTick();
    if (props.storage) {
        try {
            const cachedData = localStorage.getItem(props.storage);
            if (typeof cachedData === 'string') {
                const parsedData = JSON.parse(cachedData);
                
                // 检查所有可能的动态字段
                const prefixes = ['receiver', 'sender'];
                const suffixes = ['Passport', 'IcFront', 'IcBack', 'WorkPermit', 'CompanyRegisterDocument', 'Others'];
                
                prefixes.forEach(prefix => {
                    suffixes.forEach(suffix => {
                        const fieldName = `${prefix}${suffix}`;
                        if (parsedData[fieldName] && typeof parsedData[fieldName] === 'object' && parsedData[fieldName].url) {
                            // 如果缓存中有该字段的值，确保字段存在并且可见
                            const idType = getIdTypeFromSuffix(suffix);
                            if (idType && form.value[`${prefix}IdType`] == idType) {
                                ensureField(fieldName, getSuffixTitle(suffix), `请上传${getSuffixTitle(suffix)}`, "file", prefix, 98 + suffixes.indexOf(suffix));
                                showField(fieldName, false);
                            }
                        }
                    });
                });
            }
        } catch (e) {
        }
    }
}

// 根据字段后缀获取对应的ID类型
const getIdTypeFromSuffix = (suffix) => {
    switch (suffix) {
        case 'Passport': return 1; // 护照
        case 'IcFront':
        case 'IcBack': return 2; // 身份证
        case 'CompanyRegisterDocument': return 3; // 公司注册文件
        case 'Others': return 4; // 其它
        case 'WorkPermit': return 5; // 工作证明
        default: return null;
    }
}

// 根据字段后缀获取标题
const getSuffixTitle = (suffix) => {
    switch (suffix) {
        case 'Passport': return '护照';
        case 'IcFront': return '身份证正面';
        case 'IcBack': return '身份证反面';
        case 'CompanyRegisterDocument': return '公司注册文件';
        case 'Others': return '其它证件';
        case 'WorkPermit': return '工作证明';
        default: return '证件';
    }
}

const handleClickAction = function(name, index) {
    emit('on-action', name, index)
}

// 处理组件焦点事件
const handleComponentFocus = (fieldName) => {
    emit('on-field-focus', fieldName);
}

// 判断字段是否有错误
const isFieldError = (fieldName) => {
    return props.errorFields && props.errorFields.includes(fieldName);
}

// 添加一个辅助函数，检查值是否有效
const isValueValid = (field, value) => {
    if (field.type === 'file') {
        // 检查文件对象是否有url
        const isValid = value && typeof value === 'object' && value.url;
        // 返回布尔值而不是URL
        return !!isValid;
    } else if (field.type === 'checkbox') {
        return Array.isArray(value) && value.length > 0;
    } else {
        return value !== undefined && value !== null && value !== '' && value !== 'undefined';
    }
}

defineExpose({
    reset() {
        if (formRef.value) {
            formRef.value.resetFields();
            // 重置后重新初始化表单值
            const initialForm = {};
            fieldList.value.forEach(field => {
                initialForm[field.name] = field.type === 'checkbox' ? [] : '';
            });
            form.value = initialForm;
        }
    },
    validate() {
        return new Promise((resolve, reject) => {
            if (!formRef.value) {
                reject(new Error('表单实例不存在'));
                return;
            }


            // 先验证所有字段
            formRef.value.validate((valid, errors) => {

                if (valid) {
                    // 再次检查所有必填字段
                    const requiredFields = fieldList.value.filter(field => field.required && !field.hidden);

                    // 详细打印每个必填字段的值和类型，帮助调试
                    // requiredFields.forEach(field => {
                    //     const value = form.value[field.name];
                    // });

                    const missingFields = requiredFields.filter(field => {
                        const value = form.value[field.name];

                        if (field.type === 'file') {
                            return !value || !value.url;
                        } else if (field.type === 'checkbox') {
                            return !Array.isArray(value) || value.length === 0;
                        } else {
                            return value === undefined || value === null || value === '' || value === 'undefined';
                        }
                    });


                    if (missingFields.length > 0) {
                        // 只取第一个缺失的字段
                        const firstMissingField = missingFields[0];
                        const errorField = {
                            field: firstMissingField.name,
                            title: firstMissingField.title,
                            message: (() => {
                                switch (firstMissingField.type) {
                                    case 'file':
                                        return `请上传${firstMissingField.title}`;
                                    case 'date':
                                    case 'select':
                                    case 'checkbox':
                                        return `请选择${firstMissingField.title}`;
                                    default:
                                        return `请输入${firstMissingField.title}`;
                                }
                            })()
                        };

                        reject({
                            valid: false,
                            errors: [errorField],
                            message: `${errorField.message}`
                        });
                        return;
                    }

                    // 处理表单数据，将文件类型字段的值转换为只包含 fileId
                    const processedForm = { ...form.value };
                    fieldList.value.forEach(field => {
                        if (field.type === 'file' && processedForm[field.name]) {
                            const fileValue = processedForm[field.name];
                            if (fileValue && typeof fileValue === 'object' && 'fileId' in fileValue) {
                                processedForm[field.name] = fileValue.fileId;
                            }
                        }
                    });

                    resolve(processedForm);
                } else {
                    // 检查errors是否存在
                    if (!errors || !Array.isArray(errors) || errors.length === 0) {

                        // 尝试手动检查所有字段
                        const requiredFields = fieldList.value.filter(field => field.required && !field.hidden);

                        // 检查每个字段并打印详细信息
                        let firstInvalidField = null;
                        let allFieldsValid = true;

                        for (const field of requiredFields) {
                            const value = form.value[field.name];
                            const isValid = isValueValid(field, value);

                            // if (field.type === 'file' && typeof value === 'object' && value.url) {
                            // }

                            if (!isValid) {
                                allFieldsValid = false;
                                if (!firstInvalidField) {
                                    firstInvalidField = field;
                                }
                            }
                        }

                        // 如果所有字段都有效，则验证通过
                        if (allFieldsValid) {
                            // 处理表单数据
                            const processedForm = { ...form.value };
                            fieldList.value.forEach(field => {
                                if (field.type === 'file' && processedForm[field.name]) {
                                    const fileValue = processedForm[field.name];
                                    if (fileValue && typeof fileValue === 'object' && 'fileId' in fileValue) {
                                        processedForm[field.name] = fileValue.fileId;
                                    }
                                }
                            });
                            resolve(processedForm);
                            return;
                        }

                        if (firstInvalidField) {
                            // 构建错误信息
                            let errorMessage;
                            switch (firstInvalidField.type) {
                                case 'file':
                                    errorMessage = `请上传${firstInvalidField.title}`;
                                    break;
                                case 'date':
                                case 'select':
                                case 'checkbox':
                                    errorMessage = `请选择${firstInvalidField.title}`;
                                    break;
                                default:
                                    errorMessage = `请输入${firstInvalidField.title}`;
                                    break;
                            }

                            reject({
                                valid: false,
                                errors: [{
                                    field: firstInvalidField.name,
                                    title: firstInvalidField.title,
                                    message: errorMessage
                                }],
                                message: errorMessage
                            });
                        } else {
                            // 当errors不存在时，返回通用错误信息
                            reject({
                                valid: false,
                                errors: [],
                                message: '表单验证失败，请检查必填项'
                            });
                        }
                        return;
                    }

                    // 只取第一个验证失败的字段
                    const firstError = errors[0];
                    const field = fieldList.value.find(f => f.name === firstError.field);
                    const errorField = {
                        field: firstError.field,
                        title: field ? field.title : firstError.field,
                        message: firstError.message
                    };

                    reject({
                        valid: false,
                        errors: [errorField],
                        message: `${errorField.message}`
                    });
                }
            });
        });
    },
})

onMounted(() => {
    init()
})
</script>

<style scoped>
.ui-render-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
.ui-render-label .text {
    margin-right: 0;
    display: inline-flex;
    align-items: center;
}
.ui-render-label .required-mark {
    color: var(--ui-color-error-strong);
    margin-right: 2px;
    font-size: 14px;
    line-height: 1;
}
.ui-render-label .help-icon {
    color: var(--ui-color-neutral-550);
}
.ui-render-input {
    display: flex;
}
.ui-render-input .ui-render-actions {
    flex-shrink: 0;
    margin-left: 20px;
    padding-top: 12px;
    line-height: 16px;
}

/* 错误样式 */
.form-item-error :deep(.ivu-form-item-label) {
    color: var(--ui-color-error-strong);
}

.form-item-error :deep(.ivu-select-selection),
.form-item-error :deep(.ivu-input),
.input-error {
    border-color: #ed4014 !important;
}
</style>