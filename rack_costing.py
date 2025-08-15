from openpyxl import Workbook
from openpyxl.utils import get_column_letter

INPUT_FIELDS = {
    "Rack Type": "A",
    "Rack Size: Span (mm)": "2600",
    "Rack Size: Depth (mm)": "1000",
    "Rack Size: Height (mm)": "4800",
    "No of level": "4",
    "UP level": "0",
    "HT": "3",
    "CT": "7",
    "Rack Qty: Basic A": "15",
    "Rack Qty: Addon A": "19",
}

ITEM_COLS = [
    "Item","Blank","length","tk","Qty","Unit Weight","Total Weight","Side to be coated",
    "Steel rate","Outside Labor C/B/P (in kg)","Inside Labor (Fab) in kg",
    "Powder/paint rate in sqft","Coating rate/unit","Blasting /Gas and Disel rate/kg",
    "Rate/ unit","TOTAL"
]

ITEM_ROWS = [
    ["column","255","4800","1.6","98","15.37","1506.60","2.00","57.25","0","0","5.75","1.50","1.75","1124.19","110170.53"],
    ["H.T","99","913","1.5","147","1.06","156.45","0.00","64.50","0","0","5.75","1.50","1.75","69.13","10161.86"],
    ["C.T.","99","1098","1.5","343","1.28","438.85","0.00","64.50","0","0","5.75","1.50","1.75","83.10","28504.18"],
    ["foot","178","154","3","98","0.65","63.26","2.00","53.50","0","0","5.75","1.50","1.75","40.11","3930.45"],
    ["STEP Beam 80 X 50 X 2600 mm for 800 kg Udl","265","2600","1.6","272","8.65","2353.84","1.00","56.75","0","0","5.75","1.50","1.75","561.50","152728.21"],
    ["Beam 80 X 50 X 1550 mm for 250 kg Udl","265","1000","1.6","120","3.33","399.41","1.00","58.00","0","0","5.75","1.50","1.75","220.15","26418.18"],
    ["BEAM BKT","95","125","3","784","0.28","219.25","2.00","53.50","0","0","5.75","1.50","1.75","17.37","13621.52"],
    ["Panel 200 mm 13","312","1000","0.8","1768","1.96","3464.15","0.00","64.50","0","0","5.75","1.50","1.75","127.26","225001.64"],
    ["Column Guard","250","416","4","49","3.27","160.01","2.00","53.50","0","0","5.75","1.50","1.75","196.15","9611.16"],
    ["Row Guard 1000 mm long","210","1800","2","3","5.93","17.80","2.00","60.00","0","0","5.75","1.50","1.75","432.04","1296.11"],
    ["Row Guard 2050 mm long","210","2850","2","5","9.40","46.98","2.00","60.00","0","0","5.75","1.50","1.75","684.06","3420.30"],
    ["Plate for raw guard","125","125","3","16","0.37","5.89","2.00","53.50","0","0","5.75","1.50","1.75","22.86","365.78"],
    ["ANCHOR","0","0","-","391","0.07","27.37","0.00","370.00","0","0","5.75","0.00","1.75","26.08","10197.79"],
]

CALC_COLS = [
    "Unit area","Total Area for coating",
    "Steel Cost in kg Unit Cost","Steel Cost in kg Total Cost",
    "Outside C/B/P (in kg) Unit Cost","Outside C/B/P (in kg) Total Cost",
    "Inhouse (Fab) in kg Unit Cost","Inhouse (Fab) in kg Total Cost",
    "Powder/paint in sqft Unit Cost","Powder/paint in sqft Total Cost",
    "Coating + Blasting + Gas and Disel rate Unit Cost","Coating + Blasting + Gas and Disel rate Total Cost",
    "Power & other consumable"
]

PRICE_SCHEDULE_ROWS = [
    ["A","HD SHELVING RACK (AREA 1)","","","Rs.","Rs."],
    ["1","Basic Modules with G+4 loading levels type A","15","Set","31040.00","465600.00"],
    ["2","Add-on Modules with G+4 loading levels type A","19","Set","25510.00","484690.00"],
    ["3","Column guard","49","Nos","470.00","23030.00"],
    ["4","Row guard 1000 mm long","3","Nos","1260.00","3780.00"],
    ["5","Row guard 2050 mm long","5","Nos","1690.00","8450.00"],
    ["","Total Basic Price for A","","","","985550.00"],
]

def build_workbook():
    wb = Workbook()
    ws_input = wb.active
    ws_input.title = "Input"
    for r,(k,v) in enumerate(INPUT_FIELDS.items(), start=1):
        ws_input.cell(row=r, column=1, value=k)
        ws_input.cell(row=r, column=2, value=v)

    ws_calc = wb.create_sheet("Calculation Sheet")
    headers = ITEM_COLS + CALC_COLS
    for c, h in enumerate(headers, start=1):
        ws_calc.cell(row=1, column=c, value=h)

    calc_start = len(ITEM_COLS) + 1

    for r, row in enumerate(ITEM_ROWS, start=2):
        for c, val in enumerate(row, start=1):
            ws_calc.cell(row=r, column=c, value=val)
        blank_col = ITEM_COLS.index("Blank") + 1
        length_col = ITEM_COLS.index("length") + 1
        qty_col = ITEM_COLS.index("Qty") + 1
        unit_wt_col = ITEM_COLS.index("Unit Weight") + 1
        side_col = ITEM_COLS.index("Side to be coated") + 1
        steel_rate_col = ITEM_COLS.index("Steel rate") + 1
        out_rate_col = ITEM_COLS.index("Outside Labor C/B/P (in kg)") + 1
        in_rate_col = ITEM_COLS.index("Inside Labor (Fab) in kg") + 1
        powder_rate_col = ITEM_COLS.index("Powder/paint rate in sqft") + 1
        coat_rate_col = ITEM_COLS.index("Coating rate/unit") + 1
        blast_rate_col = ITEM_COLS.index("Blasting /Gas and Disel rate/kg") + 1
        # formulas
        ws_calc.cell(row=r, column=calc_start, value=f"=({get_column_letter(blank_col)}{r}*{get_column_letter(length_col)}{r})/(305*305)")
        ws_calc.cell(row=r, column=calc_start+1, value=f"={get_column_letter(calc_start)}{r}*{get_column_letter(side_col)}{r}")
        ws_calc.cell(row=r, column=calc_start+2, value=f"={get_column_letter(unit_wt_col)}{r}*{get_column_letter(steel_rate_col)}{r}")
        ws_calc.cell(row=r, column=calc_start+3, value=f"={get_column_letter(calc_start+2)}{r}*{get_column_letter(qty_col)}{r}")
        ws_calc.cell(row=r, column=calc_start+4, value=f"={get_column_letter(unit_wt_col)}{r}*{get_column_letter(out_rate_col)}{r}")
        ws_calc.cell(row=r, column=calc_start+5, value=f"={get_column_letter(calc_start+4)}{r}*{get_column_letter(qty_col)}{r}")
        ws_calc.cell(row=r, column=calc_start+6, value=f"={get_column_letter(unit_wt_col)}{r}*{get_column_letter(in_rate_col)}{r}")
        ws_calc.cell(row=r, column=calc_start+7, value=f"={get_column_letter(calc_start+6)}{r}*{get_column_letter(qty_col)}{r}")
        ws_calc.cell(row=r, column=calc_start+8, value=f"={get_column_letter(calc_start+1)}{r}*{get_column_letter(powder_rate_col)}{r}")
        ws_calc.cell(row=r, column=calc_start+9, value=f"={get_column_letter(calc_start+8)}{r}*{get_column_letter(qty_col)}{r}")
        ws_calc.cell(row=r, column=calc_start+10, value=f"={get_column_letter(calc_start+1)}{r}*({get_column_letter(coat_rate_col)}{r}+{get_column_letter(blast_rate_col)}{r})")
        ws_calc.cell(row=r, column=calc_start+11, value=f"={get_column_letter(calc_start+10)}{r}*{get_column_letter(qty_col)}{r}")
        ws_calc.cell(row=r, column=calc_start+12, value=f"=({get_column_letter(calc_start+3)}{r}+{get_column_letter(calc_start+9)}{r})*0.007")

    total_row = len(ITEM_ROWS) + 1
    ws_calc.cell(row=total_row, column=1, value="Total")
    for c in range(calc_start+3, calc_start+12):
        col_letter = get_column_letter(c)
        ws_calc.cell(row=total_row, column=c, value=f"=SUM({col_letter}2:{col_letter}{total_row-1})")

    ws_rack = wb.create_sheet("Rack Calculation Sheet")
    rack_data = [
        ["Frame",3222.02,"Qty.","Manu",1.687],
        ["Basic A",17831.73,15,267475.97,30082.13,451231.95],
        ["Addon A",14609.71,19,277584.52,24646.58,468285.08],
        ["Column Guard",274.39,49,13445.11,462.90,22681.91],
        ["Row Guard 1000 mm long",634.25,3,1902.74,1069.97,3209.92],
        ["Row Guard 2050 mm long",886.27,5,4431.34,1495.14,7475.68],
    ]
    for r,row in enumerate(rack_data, start=1):
        for c,val in enumerate(row, start=1):
            ws_rack.cell(row=r,column=c,value=val)

    ws_overall = wb.create_sheet("Overall Calculation Sheet")
    overall_rows = [
        ("Total material cost (Steel + Powder)", f"='Calculation Sheet'!{get_column_letter(calc_start+3)}{total_row}+ 'Calculation Sheet'!{get_column_letter(calc_start+9)}{total_row}"),
        ("Coating + Blasting + Gas and Disel rate", f"='Calculation Sheet'!{get_column_letter(calc_start+11)}{total_row}"),
        ("Outside C/B/P Cost", f"='Calculation Sheet'!{get_column_letter(calc_start+5)}{total_row}"),
        ("Inhouse Fab. Cost", f"='Calculation Sheet'!{get_column_letter(calc_start+7)}{total_row}"),
        ("Power Consuption", f"='Calculation Sheet'!{get_column_letter(calc_start+12)}{total_row}"),
    ]
    for r,(name,formula) in enumerate(overall_rows, start=1):
        ws_overall.cell(row=r,column=1,value=name)
        ws_overall.cell(row=r,column=2,value=f"={formula}")

    ws_price = wb.create_sheet("PRICE SCHEDULE")
    for r,row in enumerate(PRICE_SCHEDULE_ROWS, start=1):
        for c,val in enumerate(row, start=1):
            ws_price.cell(row=r,column=c,value=val)

    return wb

if __name__ == "__main__":
    wb = build_workbook()
    wb.save("rack_costing.xlsx")
    print("Workbook written to rack_costing.xlsx")
