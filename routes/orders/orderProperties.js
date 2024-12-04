const orderDepartments = {
    ICU: 0,
    SW: 1,
    OP: 2,
    PICU: 3,
    RESEARCH: 4,
    PERFUSION: 5,
    ANESTHESIA: 6,
    SCRUB_NURSE: 7,
}

const orderDepartmentNames = {
    0: "ICU",
    1: "SW",
    2: "OP",
    3: "PICU",
    4: "RESEARCH",
    5: "PERFUSION",
    6: "ANESTHESIA",
    7: "SCRUB_NURSE",
}
const orderStatus = {
    PENDING_APPROVAL: 0,
    REJECTED_BY_HR: 1,
    WAITING_FOR_WAREHOUSE: 2,
    REJECTED_BY_WAREHOUSE: 3,
    PENDING_DELIVERY: 4,
    COMPLETED: 5
}

const orderStatusNames = {
    0: "PENDING_APPROVAL",
    1: "REJECTED_BY_HR",
    2: "WAITING_FOR_WAREHOUSE",
    3: "REJECTED_BY_WAREHOUSE",
    4: "PENDING_DELIVERY",
    5: "COMPLETED"
}

const orderTypes = {
    DRUG: 0,
    DISPOSABLE: 1,
    EQUIPMENT: 2,
    DEVICES: 3
}

const orderTypeNames = {
    0: "DRUG",
    1: "DISPOSABLE",
    2: "EQUIPMENT",
    3: "DEVICES"
}

module.exports = {
    orderDepartments,
    orderStatus,
    orderTypes,
    orderDepartmentNames,
    orderTypeNames,
    orderStatusNames
}