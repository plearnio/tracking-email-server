const test1 = {
  type: 'object',
  properties: {
    stock: {
      type: 'object',
      properties: {
        relatedStocks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              alias: {
                type: 'string'
              },
              name: {
                type: 'string'
              },
              jittaScore: {
                type: 'string'
              },
              price: {
                type: 'string'
              },
              currencySign: {
                type: 'string'
              },
              jittaLine: {
                type: 'object',
                properties: {
                  value: {
                    type: 'string'
                  },
                  positive: {
                    type: 'boolean'
                  }
                },
                required: [
                  'value',
                  'positive'
                ]
              },
              testData: {
                type: 'array',
                items: {
                  type: 'array',
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        alias: {
                          type: 'string'
                        },
                        name: {
                          type: 'string'
                        }
                      }
                    },
                  }
                }
              }
            }
          },
          allowEmpty: false
        }
      },
      required: [
        'relatedStocks'
      ]
    }
  },
  required: [
    'stockSymbol',
    'stockName',
    'stockExchange',
    'stock'
  ]
}

const test2 = {
  type: 'array',
  items: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        alias: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        bello: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              alias: {
                type: 'string'
              },
              name: {
                type: 'string'
              }
            }
          }
        }
      }
    },
  },
  allowEmpty: false
}

const test3 = {
  type: 'object',
  properties: {
    bello: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          alias: {
            type: 'string'
          },
          name: {
            type: 'string'
          }
        }
      }
    },
    name: {
      type: 'string'
    },
    arrrrr: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          alias: {
            type: 'string'
          },
          arr2: {
            type: 'array',
            items: {
              type: 'array',
              items: {
                type: 'number'
              }
            }
          }
        }
      }
    }   
  }
}

const test4 = {
  "type": "object",
  "properties": {
    "vars": {
      "type": "object",
      "properties": {
        "stock": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id",
          ]
        },
      },
      "required": [
        "stock",
      ]
    }
  },
  "required": []
}

const parseObject = (parent, obj) => {
  if (obj.type === 'object') {
    Object.entries(obj.properties).forEach(([element, value]) => {
      if ((value.type !== 'object') && (value.type !== 'array')) parent[element] = value.type
      else if (value.type === 'array') {
        parent[element] = { 0: {} }
        parseObject(parent[element][0], value)
      } else {
        parent[element] = {}
        parseObject(parent[element], value)
      }
    })
  } else if (obj.type === 'array') {
    if (obj.items.type === 'object') parseObject(parent, obj.items)
    else if (obj.items.type === 'array') {
      parent[0] = {}
      parseObject(parent[0], obj.items)
    } else {
      const childData = []
      childData.push(obj.items.type)
      parent[0] = childData
      parseObject(parent[0], obj.items)
    }
  } else {
    return true
  }
}

const convertArray = (obj) => {
  const arr = Object.values(obj)
  const arrKey = Object.keys(obj)
  for (let i = 0; i < arr.length; i += 1) {
    const checkType = toString.call(arr[i]).toString() === '[object Object]'
    if (checkType) {
      const checkKeyZero = Object.keys(arr[i]).includes('0')
      if (checkKeyZero) {
        const newObj = Object.keys(arr[i]).map((key) => {
          if (key === '0') {
            return arr[i][key]
          }
        })
        obj[arrKey[i].toString()] = newObj
        convertArray(obj[arrKey[i].toString()])
      } else {
        convertArray(arr[i])
      }
    }
  }
}

const startParseObject = (data) => {
  let result
  if (data.type === 'object') {
    result = {}
    parseObject(result, data)
  } else if (data.type === 'array') {
    result = { 0: {} }
    parseObject(result[0], data)
  }

  convertArray(result)
  let newResult = []
  if (result[0]) {
    result = result[0]
    newResult.push(result)
  } else {
    newResult = result
  }
  return newResult
}

console.log(startParseObject(test1))
console.log(startParseObject(test2))
console.log(startParseObject(test3))
console.log(startParseObject(test4))

module.exports = startParseObject
