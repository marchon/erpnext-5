// Copyright (c) 2017, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

var in_progress = false;

frappe.ui.form.on('Payroll Entry', {
	onload: function (frm) {
		frm.doc.posting_date = frappe.datetime.nowdate();
		frm.toggle_reqd(['payroll_frequency'], !frm.doc.salary_slip_based_on_timesheet);
	},

	refresh: function(frm) {
		if (frm.doc.docstatus==1) {
			if(frm.doc.payment_account) {
				frm.add_custom_button("Make Bank Entry", function() {
					make_bank_entry(frm);
				});
			}

			frm.add_custom_button("Submit Salary Slip", function() {
				submit_salary_slip(frm);
			});

			frm.add_custom_button("View Salary Slip", function() {
				frappe.set_route('List', 'Salary Slip',
					{posting_date: frm.doc.posting_date});
			});
		}
	},

	setup: function (frm) {
		frm.set_query("payment_account", function () {
			var account_types = ["Bank", "Cash"];
			return {
				filters: {
					"account_type": ["in", account_types],
					"is_group": 0,
					"company": frm.doc.company
				}
			};
		}),
		frm.set_query("cost_center", function () {
			return {
				filters: {
					"is_group": 0,
					company: frm.doc.company
				}
			};
		}),
		frm.set_query("project", function () {
			return {
				filters: {
					company: frm.doc.company
				}
			};
		});
	},

	payroll_frequency: function (frm) {
		frm.trigger("set_start_end_dates");
		frm.set_value('employees', []);
	},

	company: function (frm) {
		frm.set_value('employees', []);
	},

	department: function (frm) {
		frm.set_value('employees', []);
	},

	designation: function (frm) {
		frm.set_value('employees', []);
	},

	branch: function (frm) {
		frm.set_value('employees', []);
	},

	start_date: function (frm) {
		if(!in_progress && frm.doc.start_date){
			frm.trigger("set_end_date");
		}else{
			// reset flag
			in_progress = false;
		}
		frm.set_value('employees', []);
	},

	project: function (frm) {
		frm.set_value('employees', []);
	},

	salary_slip_based_on_timesheet: function (frm) {
		frm.toggle_reqd(['payroll_frequency'], !frm.doc.salary_slip_based_on_timesheet);
	},

	set_start_end_dates: function (frm) {
		if (!frm.doc.salary_slip_based_on_timesheet) {
			frappe.call({
				method: 'erpnext.hr.doctype.payroll_entry.payroll_entry.get_start_end_dates',
				args: {
					payroll_frequency: frm.doc.payroll_frequency,
					start_date: frm.doc.posting_date
				},
				callback: function (r) {
					if (r.message) {
						in_progress = true;
						frm.set_value('start_date', r.message.start_date);
						frm.set_value('end_date', r.message.end_date);
					}
				}
			});
		}
	},

	set_end_date: function(frm){
		frappe.call({
			method: 'erpnext.hr.doctype.payroll_entry.payroll_entry.get_end_date',
			args: {
				frequency: frm.doc.payroll_frequency,
				start_date: frm.doc.start_date
			},
			callback: function (r) {
				if (r.message) {
					frm.set_value('end_date', r.message.end_date);
				}
			}
		});
	},
});

// Submit salary slips

let submit_salary_slip = function (frm) {
	var doc = frm.doc;
	return $c('runserverobj', { 'method': 'submit_salary_slips', 'docs': doc });
};

cur_frm.cscript.get_employee_details = function (doc) {
	var callback = function (r) {
		if (r.docs[0].employees){
			cur_frm.refresh_field('employees');
		}
	};
	return $c('runserverobj', { 'method': 'fill_employee_details', 'docs': doc }, callback);
};

let make_bank_entry = function (frm) {
	var doc = frm.doc;
	if (doc.company && doc.start_date && doc.end_date) {
		return frappe.call({
			doc: cur_frm.doc,
			method: "make_payment_entry",
			callback: function (r) {
				if (r.message)
					var doc = frappe.model.sync(r.message)[0];
				frappe.set_route("Form", doc.doctype, doc.name);
			}
		});
	} else {
		frappe.msgprint(__("Company, From Date and To Date is mandatory"));
	}
};
