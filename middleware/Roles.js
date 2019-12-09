const flatten = require('flat')
// Flatted Objects to eliminate nesting issues
const All_Roles = flatten(Object.freeze({  
  Admin: 'admin',
  Company: 'company',
  Owner: 'owner',
  Office: {
    Admin: 'office.admin',
    Mod: 'office.mod',
    Basic: 'office.basic'
  },
  Shop: {
    Admin: 'shop.admin',
    Mod: 'shop.mod',
    Basic: 'shop.basic' 
  },
  Installer: {
    Admin: 'installer.admin',
    Mod: 'installer.mod',
    Basic: 'installer.basic'
  },
  Basic: 'basic',
  Customer: 'customer'
}))
const Low_Roles = flatten(Object.freeze({  
  Admin: 'admin',
  Company: 'company',
  Owner: 'owner',
  Office: {
    Admin: 'office.admin',
    Mod: 'office.mod',
    Basic: 'office.basic'
  },
  Shop: {
    Admin: 'shop.admin',
    Mod: 'shop.mod',
    Basic: 'shop.basic' 
  },
  Installer: {
    Admin: 'installer.admin',
    Mod: 'installer.mod',
    Basic: 'installer.basic'
  }
}))
const Mid_Roles = flatten(Object.freeze({  
  Admin: 'admin',
  Company: 'company',
  Owner: 'owner',
  Office: {
    Admin: 'office.admin',
    Mod: 'office.mod'
  },
  Shop: {
    Admin: 'shop.admin',
    Mod: 'shop.mod'
  },
  Installer: {
    Admin: 'installer.admin',
    Mod: 'installer.mod'
  }
}))
const High_Roles = flatten(Object.freeze({  
  Admin: 'admin',
  Company: 'company',
  Owner: 'owner',
  Office: { Admin: 'office.admin'},
  Shop: { Admin: 'shop.admin' },
  Installer: { Admin: 'installer.admin' }
}))
const Company_Roles = flatten(Object.freeze({  
  Admin: 'admin',
  Company: 'company',
  Owner: 'owner'
}))
const Admin_Roles = flatten(Object.freeze({  
  Admin: 'admin'
}))
const Office_Roles = flatten(Object.freeze({  
  Admin: 'admin',
  Company: 'company',
  Owner: 'owner',
  Office: {
    Admin: 'office.admin',
    Mod: 'office.mod',
    Basic: 'office.basic'
  }
}))
const Shop_Roles = flatten(Object.freeze({  
  Admin: 'admin',
  Company: 'company',
  Owner: 'owner',
  Shop: {
    Admin: 'shop.admin',
    Mod: 'shop.mod',
    Basic: 'shop.basic' 
  }
}))
const Installer_Roles = flatten(Object.freeze({  
  Admin: 'admin',
  Company: 'company',
  Owner: 'owner',
  Installer: {
    Admin: 'installer.admin',
    Mod: 'installer.mod',
    Basic: 'installer.basic'
  },
}))
const Customer_Roles = flatten(Object.freeze({  
  Admin: 'admin',
  Company: 'company',
  Owner: 'owner',
  Customer: 'customer'
}))

module.exports = {
  // Auth-Level Based Roles
  All_Roles,
  Low_Roles,
  Mid_Roles,
  High_Roles,
  Company_Roles,
  Admin_Roles,
  // Staff-Group Based Roles
  Office_Roles,
  Shop_Roles,
  Installer_Roles,
  // Customer Roles
  Customer_Roles

}