// Copyright (c) 2017, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Shifts Types', {
	to_time: function(frm, cdt, cdn) {
                 var shft = locals[cdt][cdn];
                 frappe.call({
                        method: "erpnext.hr.doctype.shifts_types.shifts_types.get_shift_hours",
                        args:{
                               toTime: shft.to_time,
                               fromTime: shft.from_time
                             },
                        callback: function(r){
                                frappe.model.set_value(cdt, cdn, "hours", r.message);
                             }
                  });                
	},
        from_time: function(frm, cdt, cdn) {
                 var shft = locals[cdt][cdn];
                 frappe.call({
                        method: "erpnext.hr.doctype.shifts_types.shifts_types.get_shift_hours",
                        args:{
                               toTime: shft.to_time,
                               fromTime: shft.from_time
                             },
                        callback: function(r){
                                frappe.model.set_value(cdt, cdn, "hours", r.message);
                             }
                  });                
	}
        hours:function(frm){
              msgprint("Hi");
        }
});
