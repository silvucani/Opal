import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import logo from './assets/logo.png';

/* ─── INLINE DATA (generated from audit_engine.py + populate_db.py) ─── */
const F=[{"hostname":"host-edge840-01","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":8,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-02","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":6,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-03","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":67,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"100M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-04","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":74,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"100M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-05","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":109,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"200M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-06","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":80,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 720","license":"Enterprise","bandwidth_tier":"100M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":350,"complexity":"Moyenne","cause":"SFP"}},{"hostname":"host-edge840-07","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":154,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 720","license":"Enterprise","bandwidth_tier":"200M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":350,"complexity":"Moyenne","cause":"SFP"}},{"hostname":"host-edge840-08","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":40,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-09","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":34,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-10","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":48,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-11","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":840,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 720","license":"Enterprise","bandwidth_tier":"1G","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":350,"complexity":"Moyenne","cause":"SFP + IMIX throughput"}},{"hostname":"host-edge840-12","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":40,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-13","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":30,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"30M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-14","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":1430,"tunnels":60,"flows_per_sec":21000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 740","license":"Enterprise","bandwidth_tier":"2G","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":700,"complexity":"Elevee","cause":"flows/s"}},{"hostname":"host-edge840-15","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":88,"tunnels":80,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 720","license":"Enterprise","bandwidth_tier":"100M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":350,"complexity":"Moyenne","cause":"tunnels"}},{"hostname":"host-edge840-16","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":184,"tunnels":80,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 720","license":"Enterprise","bandwidth_tier":"200M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":350,"complexity":"Moyenne","cause":"tunnels"}},{"hostname":"host-edge840-17","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":1059,"tunnels":80,"flows_per_sec":19000,"concurrent_flows":480000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 740","license":"Enterprise","bandwidth_tier":"2G","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":700,"complexity":"Elevee","cause":"flows/s + concurrent flows"}},{"hostname":"host-edge840-18","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":44,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-19","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":38,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-20","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":39,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-21","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":59,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"100M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-22","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":289,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 720","license":"Enterprise","bandwidth_tier":"500M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":350,"complexity":"Moyenne","cause":"SFP"}},{"hostname":"host-edge840-23","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":35,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-24","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":44,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-25","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":9,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-26","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":79,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"100M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-27","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":77,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"100M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-28","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":41,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 720","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":350,"complexity":"Moyenne","cause":"SFP"}},{"hostname":"host-edge840-29","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":83,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"100M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-30","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":40,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-31","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":38,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-32","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":34,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-33","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":36,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-34","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":40,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 720","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":350,"complexity":"Moyenne","cause":"SFP"}},{"hostname":"host-edge840-35","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":46,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 720","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":350,"complexity":"Moyenne","cause":"SFP"}},{"hostname":"host-edge840-36","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":44,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-37","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":34,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-38","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":39,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-39","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":33,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 720","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":350,"complexity":"Moyenne","cause":"SFP"}},{"hostname":"host-edge840-40","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":37,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-41","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":46,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-42","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":40,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-43","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":42,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-44","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":34,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-45","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":48,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-46","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":44,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-47","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":38,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-48","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":36,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-49","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":34,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-50","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":46,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-51","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":40,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-52","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":88,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"100M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-53","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":24,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 720","license":"Enterprise","bandwidth_tier":"30M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":350,"complexity":"Moyenne","cause":"SFP"}},{"hostname":"host-edge840-54","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":22,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 720","license":"Enterprise","bandwidth_tier":"30M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":350,"complexity":"Moyenne","cause":"SFP"}},{"hostname":"host-edge840-55","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":13,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"30M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-56","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":15,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"30M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-57","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":19,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"30M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-58","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":26,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"30M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-59","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":27,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"30M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-60","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":20,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"30M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-61","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":12,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"30M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-62","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":18,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"30M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-63","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":15,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"30M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-64","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":16,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"30M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-65","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":6,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-66","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":4,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-67","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":8,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-68","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":7,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-69","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":6,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-70","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":6,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-71","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":2,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-72","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":5,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-73","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":7,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-74","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":6,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-75","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":4,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-76","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":2,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-77","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":3,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-78","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":3,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-79","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":7,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge840-80","model":"Edge840","version":"4.2.2","lifecycle":{"urgency":"CRITICAL","status":"Past EoL \u2014 no vendor support","eos_date":"2020-09-29","eol_date":"2025-09-29","is_eol":true,"is_eos":true},"measured":{"throughput_mbps":4,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Moyenne","cause":""}},{"hostname":"host-edge680-01","model":"Edge680","version":"5.0.0","lifecycle":{"urgency":"HIGH","status":"EoS reached \u2014 plan replacement","eos_date":"2022-07-29","eol_date":"2027-07-29","is_eol":false,"is_eos":true},"measured":{"throughput_mbps":5,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Faible","cause":""}},{"hostname":"host-edge680-02","model":"Edge680","version":"5.0.0","lifecycle":{"urgency":"HIGH","status":"EoS reached \u2014 plan replacement","eos_date":"2022-07-29","eol_date":"2027-07-29","is_eol":false,"is_eos":true},"measured":{"throughput_mbps":6,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":0,"rj45_ports":4},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Faible","cause":""}},{"hostname":"host-edge680-03","model":"Edge680","version":"5.0.0","lifecycle":{"urgency":"HIGH","status":"EoS reached \u2014 plan replacement","eos_date":"2022-07-29","eol_date":"2027-07-29","is_eol":false,"is_eos":true},"measured":{"throughput_mbps":7,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Faible","cause":""}},{"hostname":"host-edge680-04","model":"Edge680","version":"5.0.0","lifecycle":{"urgency":"HIGH","status":"EoS reached \u2014 plan replacement","eos_date":"2022-07-29","eol_date":"2027-07-29","is_eol":false,"is_eos":true},"measured":{"throughput_mbps":4,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Faible","cause":""}},{"hostname":"host-edge680-05","model":"Edge680","version":"5.0.0","lifecycle":{"urgency":"HIGH","status":"EoS reached \u2014 plan replacement","eos_date":"2022-07-29","eol_date":"2027-07-29","is_eol":false,"is_eos":true},"measured":{"throughput_mbps":5,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":1,"rj45_ports":3},"migration":{"target_model":"Edge 710","license":"Enterprise","bandwidth_tier":"10M","upgrade_path":"5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":200,"complexity":"Faible","cause":""}},{"hostname":"host-edge680-06","model":"Edge680","version":"5.0.0","lifecycle":{"urgency":"HIGH","status":"EoS reached \u2014 plan replacement","eos_date":"2022-07-29","eol_date":"2027-07-29","is_eol":false,"is_eos":true},"measured":{"throughput_mbps":34,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 720","license":"Enterprise","bandwidth_tier":"50M","upgrade_path":"5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":350,"complexity":"Moyenne","cause":"SFP"}},{"hostname":"host-edge680-07","model":"Edge680","version":"5.0.0","lifecycle":{"urgency":"HIGH","status":"EoS reached \u2014 plan replacement","eos_date":"2022-07-29","eol_date":"2027-07-29","is_eol":false,"is_eos":true},"measured":{"throughput_mbps":168,"tunnels":80,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 720","license":"Enterprise","bandwidth_tier":"200M","upgrade_path":"5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":350,"complexity":"Moyenne","cause":"SFP + tunnels"}},{"hostname":"host-edge680-08","model":"Edge680","version":"5.0.0","lifecycle":{"urgency":"HIGH","status":"EoS reached \u2014 plan replacement","eos_date":"2022-07-29","eol_date":"2027-07-29","is_eol":false,"is_eos":true},"measured":{"throughput_mbps":589,"tunnels":450,"flows_per_sec":22000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 740","license":"Enterprise","bandwidth_tier":"1G","upgrade_path":"5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":700,"complexity":"Elevee","cause":"tunnels + flows/s"}},{"hostname":"host-edge680-09","model":"Edge680","version":"5.0.0","lifecycle":{"urgency":"HIGH","status":"EoS reached \u2014 plan replacement","eos_date":"2022-07-29","eol_date":"2027-07-29","is_eol":false,"is_eos":true},"measured":{"throughput_mbps":1284,"tunnels":30,"flows_per_sec":22000,"concurrent_flows":50000,"nat_entries":600000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 740","license":"Enterprise","bandwidth_tier":"2G","upgrade_path":"5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":700,"complexity":"Elevee","cause":"flows/s + NAT entries"}},{"hostname":"host-edge680-10","model":"Edge680","version":"5.0.0","lifecycle":{"urgency":"HIGH","status":"EoS reached \u2014 plan replacement","eos_date":"2022-07-29","eol_date":"2027-07-29","is_eol":false,"is_eos":true},"measured":{"throughput_mbps":88,"tunnels":30,"flows_per_sec":2000,"concurrent_flows":50000,"nat_entries":100000,"sfp_ports":2,"rj45_ports":2},"migration":{"target_model":"Edge 720","license":"Enterprise","bandwidth_tier":"100M","upgrade_path":"5.0.x -> 5.4.x -> 6.1.x -> 6.4.x","cost":350,"complexity":"Moyenne","cause":"SFP"}}];
const S={"fleet_summary":{"total_devices":90,"current_models":{"Edge840":80,"Edge680":10},"versions":{"4.2.2":80,"5.0.0":10}},"lifecycle_summary":{"urgency_distribution":{"CRITICAL":80,"HIGH":10}},"migration_summary":{"target_models":{"Edge 710":71,"Edge 720":15,"Edge 740":4},"total_cost_optimized":22250,"total_cost_baseline_all_740":63000,"savings":40750,"savings_percent":65,"complexity_distribution":{"Moyenne":81,"Elevee":4,"Faible":5}},"reference_data":{"edge_7x0_specs":[{"modele":"Edge 710","debit_max_imix_mbps":395,"max_tunnels":50,"flows_par_seconde":4000,"max_flux_concurrents":225000,"nb_ports_sfp":1},{"modele":"Edge 720","debit_max_imix_mbps":2300,"max_tunnels":400,"flows_par_seconde":18000,"max_flux_concurrents":440000,"nb_ports_sfp":2},{"modele":"Edge 740","debit_max_imix_mbps":3500,"max_tunnels":800,"flows_par_seconde":26000,"max_flux_concurrents":900000,"nb_ports_sfp":2}],"upgrade_paths":[{"version_source":"4.2.2","version_cible":"6.4.x","etapes":"4.2.2 → 4.5.2 → 5.0.x → 5.4.x → 6.1.x → 6.4.x","notes_ordre":"Ordre obligatoire : VCO d'abord, puis Gateways, puis Edges par batch"},{"version_source":"4.5.2","version_cible":"6.4.x","etapes":"4.5.2 → 5.0.x → 5.4.x → 6.1.x → 6.4.x","notes_ordre":"Ordre obligatoire"},{"version_source":"5.0.0","version_cible":"6.4.x","etapes":"5.0.x → 5.4.x → 6.1.x → 6.4.x","notes_ordre":"Ordre obligatoire"},{"version_source":"5.4.x","version_cible":"6.4.x","etapes":"5.4.x → 6.1.x → 6.4.x","notes_ordre":"Ordre obligatoire"},{"version_source":"6.1.x","version_cible":"6.4.x","etapes":"6.1.x → 6.4.x","notes_ordre":"Upgrade direct possible"}]}};

/* ─── STYLES ─── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#0c0c0e;--surface:#161619;--surface2:#1e1e22;--surface3:#28282d;
  --border:#2a2a30;--text:#e8e8ec;--text2:#9898a0;--text3:#68686f;
  --orange:#ff7900;--orange2:#ff9a40;--orange-dim:rgba(255,121,0,0.15);
  --green:#34d399;--green-dim:rgba(52,211,153,0.15);
  --yellow:#fbbf24;--yellow-dim:rgba(251,191,36,0.15);
  --red:#f87171;--red-dim:rgba(248,113,113,0.15);
  --blue:#60a5fa;--blue-dim:rgba(96,165,250,0.15);
}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text)}
.mono{font-family:'JetBrains Mono',monospace}
`;



/* ─── STAT CARD ─── */
const StatCard = ({ label, value, sub, color = "var(--orange)", icon }) => (
    <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:"24px 28px",flex:1,minWidth:200,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:color,opacity:0.8}}/>
      {icon && <div style={{fontSize:28,marginBottom:8}}>{icon}</div>}
      <div style={{fontSize:13,color:"var(--text2)",marginBottom:6,fontWeight:500,letterSpacing:"0.5px",textTransform:"uppercase"}}>{label}</div>
      <div style={{fontSize:36,fontWeight:700,color,lineHeight:1.1}}>{value}</div>
      {sub && <div style={{fontSize:13,color:"var(--text3)",marginTop:6}}>{sub}</div>}
    </div>
);

/* ─── STATUS BADGE ─── */
const Badge = ({ urgency }) => {
  const m = {CRITICAL:{bg:"var(--red-dim)",color:"var(--red)",label:"End of Life"},HIGH:{bg:"var(--yellow-dim)",color:"var(--yellow)",label:"End of Support"},MEDIUM:{bg:"var(--blue-dim)",color:"var(--blue)",label:"À Surveiller"},LOW:{bg:"var(--green-dim)",color:"var(--green)",label:"À Jour"}};
  const s = m[urgency] || m.MEDIUM;
  return <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:20,background:s.bg,color:s.color,fontSize:12,fontWeight:600}}><span style={{width:7,height:7,borderRadius:"50%",background:s.color}}/>{s.label}</span>;
};

/* ─── NAV ─── */
const navItems = [
  {id:"overview",label:"Vue d'ensemble",icon:null},
  {id:"network",label:"Arborescence Réseau",icon:null},
  {id:"eol",label:"Rapport EOL",icon:null},
  {id:"versions",label:"Versions Max",icon:null},
  {id:"upgrade",label:"Upgrade Path",icon:null},
];

/* ─── TOOLTIP ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
      <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",fontSize:13}}>
        <div style={{fontWeight:600,marginBottom:4}}>{label}</div>
        {payload.map((p,i) => <div key={i} style={{color:p.color||"var(--text)"}}>{p.name}: <strong>{p.value}</strong></div>)}
      </div>
  );
};

/* ═══════════════════ SCREEN: NETWORK MAP ═══════════════════ */
const NetworkScreen = () => {
  const [expandedNode, setExpandedNode] = useState(null);

  const edge840_710 = F.filter(e => e.model === "Edge840" && e.migration.target_model === "Edge 710");
  const edge840_720 = F.filter(e => e.model === "Edge840" && e.migration.target_model === "Edge 720");
  const edge840_740 = F.filter(e => e.model === "Edge840" && e.migration.target_model === "Edge 740");
  const edge680_710 = F.filter(e => e.model === "Edge680" && e.migration.target_model === "Edge 710");
  const edge680_720 = F.filter(e => e.model === "Edge680" && e.migration.target_model === "Edge 720");

  const nodeStyle = (color) => ({
    background: "var(--surface2)", border: `1px solid ${color}`, borderRadius: 12,
    padding: "14px 20px", cursor: "pointer", transition: "all 0.2s", position: "relative",
  });

  const connectorV = (h = 32) => (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: 2, height: h, background: "var(--border)" }} />
      </div>
  );

  const connectorH = () => (
      <div style={{ width: 40, height: 2, background: "var(--border)", flexShrink: 0 }} />
  );

  const CategoryNode = ({ id, label, count, color, urgency, children, devices }) => {
    const isOpen = expandedNode === id;
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div onClick={() => setExpandedNode(isOpen ? null : id)}
               style={{ ...nodeStyle(color), borderLeft: `3px solid ${color}`, minWidth: 180, textAlign: "center" }}
               onMouseEnter={ev => ev.currentTarget.style.background = "var(--surface3)"}
               onMouseLeave={ev => ev.currentTarget.style.background = "var(--surface2)"}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 6 }}>{count} équipements</div>
            {urgency && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 12, background: `${color}22`, fontSize: 11, fontWeight: 600, color }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                  {urgency}
                </div>
            )}
            {devices && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>Cliquer pour détails {isOpen ? "▲" : "▼"}</div>}
          </div>
          {isOpen && devices && (
              <div style={{ marginTop: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, maxHeight: 200, overflowY: "auto", width: 220 }}>
                {devices.map(d => (
                    <div key={d.hostname} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 11, borderBottom: "1px solid var(--border)" }}>
                      <span className="mono">{d.hostname}</span>
                      <span style={{ color: "var(--text3)" }}>{d.measured.throughput_mbps} Mb/s</span>
                    </div>
                ))}
              </div>
          )}
          {children}
        </div>
    );
  };

  return (
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Arborescence du Parc Réseau</h1>
        <p style={{ color: "var(--text2)", marginBottom: 24 }}>Topologie hiérarchique du parc SD-WAN VeloCloud</p>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, overflowX: "auto" }}>

          {/* ── LEVEL 0: VCO ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ ...nodeStyle("var(--orange)"), borderTop: "3px solid var(--orange)", textAlign: "center", minWidth: 240 }}>
              <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Orchestrateur</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>VCO</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>VeloCloud Orchestrator</div>
              <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 12, background: "var(--green-dim)", fontSize: 11, fontWeight: 600, color: "var(--green)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)" }} />
                Actif
              </div>
            </div>

            {connectorV(40)}

            {/* ── LEVEL 1: VCG ── */}
            <div style={{ ...nodeStyle("var(--blue)"), borderTop: "3px solid var(--blue)", textAlign: "center", minWidth: 240 }}>
              <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Gateways</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>VCG</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>VeloCloud Gateways</div>
            </div>

            {connectorV(40)}

            {/* ── LEVEL 2: MODEL SPLIT ── */}
            <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>

              {/* Edge 840 Branch */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ ...nodeStyle("#FF4848"), borderTop: "3px solid #FF4848", textAlign: "center", minWidth: 200 }}>
                  <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Modèle actuel</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Edge 840</div>
                  <div style={{ fontSize: 13, color: "var(--text3)" }}>80 équipements &middot; v4.2.2</div>
                  <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 12, background: "#FF484822", fontSize: 11, fontWeight: 600, color: "#FF4848" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF4848" }} />
                    End of Life
                  </div>
                </div>

                {connectorV()}

                {/* 840 sub-categories by target */}
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                    {connectorH()}
                    <CategoryNode id="840-710" label="→ Edge 710" count={edge840_710.length} color="var(--green)" urgency="Migration standard" devices={edge840_710} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                    {connectorH()}
                    <CategoryNode id="840-720" label="→ Edge 720" count={edge840_720.length} color="var(--orange)" urgency="SFP / Tunnels" devices={edge840_720} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                    {connectorH()}
                    <CategoryNode id="840-740" label="→ Edge 740" count={edge840_740.length} color="#FF4848" urgency="High Performance" devices={edge840_740} />
                  </div>
                </div>
              </div>

              {/* Edge 680 Branch */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ ...nodeStyle("#FFB348"), borderTop: "3px solid #FFB348", textAlign: "center", minWidth: 200 }}>
                  <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Modèle actuel</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Edge 680</div>
                  <div style={{ fontSize: 13, color: "var(--text3)" }}>10 équipements &middot; v5.0.0</div>
                  <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 12, background: "#FFB34822", fontSize: 11, fontWeight: 600, color: "#FFB348" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFB348" }} />
                    End of Support
                  </div>
                </div>

                {connectorV()}

                {/* 680 sub-categories by target */}
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                    {connectorH()}
                    <CategoryNode id="680-710" label="→ Edge 710" count={edge680_710.length} color="var(--green)" urgency="Migration standard" devices={edge680_710} />
                  </div>
                  {edge680_720.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                        {connectorH()}
                        <CategoryNode id="680-720" label="→ Edge 720" count={edge680_720.length} color="var(--orange)" urgency="SFP / Tunnels" devices={edge680_720} />
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ marginTop: 32, padding: "16px 20px", background: "var(--surface2)", borderRadius: 10, display: "flex", gap: 24, flexWrap: "wrap", fontSize: 12, color: "var(--text3)" }}>
            <div style={{ fontWeight: 600, color: "var(--text2)" }}>Légende :</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF4848" }} /> End of Life</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFB348" }} /> End of Support</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--green)" }} /> Edge 710 (standard)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--orange)" }} /> Edge 720 (performance)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF4848" }} /> Edge 740 (haute perf.)</div>
          </div>
        </div>
      </div>
  );
};

/* ═══════════════════ SCREEN 1: OVERVIEW ═══════════════════ */
const OverviewScreen = () => {
  const modelData = Object.entries(S.fleet_summary.current_models).map(([k,v])=>({name:k.replace("Edge","Edge "),value:v}));
  const targetData = Object.entries(S.migration_summary.target_models).map(([k,v])=>({name:k,value:v}));
  const urgencyData = Object.entries(S.lifecycle_summary.urgency_distribution).map(([k,v])=>({name:k,value:v}));
  const complexityData = Object.entries(S.migration_summary.complexity_distribution).map(([k,v])=>({name:k==="Elevee"?"Élevée":k,value:v}));
  const COLORS_PIE = ["#ff7900","#ff9a40","#ffbe80","#ffd9b3"];
  const COLORS_URG = ["#f87171","#fbbf24","#60a5fa","#34d399"];

  return (
      <div>
        <div style={{marginBottom:32}}>
          <h1 style={{fontSize:40,fontWeight:700,marginBottom:4}}>Bienvenue,</h1>
          <p style={{color:"var(--text2)",fontSize:16}}>Vue d'ensemble du parc SD-WAN VeloCloud</p>
        </div>

        {/* KPI Cards */}
        <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:32}}>
          <StatCard label="Équipements" value={S.fleet_summary.total_devices} sub="Parc total" color="var(--orange)"/>
          <StatCard label="End of Life" value={S.lifecycle_summary.urgency_distribution.CRITICAL||0} sub="Support expiré" color="#FF4848"/>
          <StatCard label="End of Support" value={S.lifecycle_summary.urgency_distribution.HIGH||0} sub="Fin de vente" color="#FFB348"/>
          <StatCard label="Économies" value={`${S.migration_summary.savings_percent}%`} sub={`${S.migration_summary.savings.toLocaleString()} économisés`} color="var(--green)"/>
        </div>

        {/* Charts Row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:32}}>
          {/* Current Models */}
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>
            <h3 style={{fontSize:16,fontWeight:600,marginBottom:20,color:"var(--text2)"}}>Modèles actuels</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={modelData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none" label={({name,value})=>`${name} (${value})`} style={{fontSize:12}}>
                {modelData.map((_,i)=><Cell key={i} fill={COLORS_PIE[i%COLORS_PIE.length]}/>)}
              </Pie><Tooltip content={<CustomTooltip/>}/></PieChart>
            </ResponsiveContainer>
          </div>
          {/* Target Models */}
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>
            <h3 style={{fontSize:16,fontWeight:600,marginBottom:20,color:"var(--text2)"}}>Recommandation Migration</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={targetData} barSize={40}><XAxis dataKey="name" tick={{fill:"var(--text2)",fontSize:12}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"var(--text3)",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip content={<CustomTooltip/>}/><Bar dataKey="value" radius={[6,6,0,0]}>
                {targetData.map((_,i)=><Cell key={i} fill={["#ff7900","#ff9a40","#ffbe80"][i]}/>)}
              </Bar></BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Comparison + Distribution */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>
            <h3 style={{fontSize:16,fontWeight:600,marginBottom:20,color:"var(--text2)"}}>Comparaison des coûts</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[{name:"Baseline (tout 740)",cost:S.migration_summary.total_cost_baseline_all_740},{name:"Optimisé",cost:S.migration_summary.total_cost_optimized}]} barSize={50} layout="vertical">
                <XAxis type="number" tick={{fill:"var(--text3)",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" tick={{fill:"var(--text2)",fontSize:12}} width={130} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="cost" radius={[0,6,6,0]}>
                  <Cell fill="#f87171"/><Cell fill="#34d399"/>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{textAlign:"center",marginTop:8,padding:"8px 16px",background:"var(--green-dim)",borderRadius:10,display:"inline-flex",gap:6,alignItems:"center"}}>
              <span style={{color:"var(--green)",fontWeight:700,fontSize:20}}>{S.migration_summary.savings.toLocaleString()}</span>
              <span style={{color:"var(--green)",fontSize:13}}>d'économies ({S.migration_summary.savings_percent}%)</span>
            </div>
          </div>
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>
            <h3 style={{fontSize:16,fontWeight:600,marginBottom:20,color:"var(--text2)"}}>Urgence & Complexité</h3>
            <div style={{display:"flex",gap:24}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:"var(--text3)",marginBottom:8,fontWeight:500}}>URGENCE</div>
                {urgencyData.map((d,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <span style={{width:10,height:10,borderRadius:"50%",background:COLORS_URG[i]}}/>
                      <span style={{fontSize:13,flex:1}}>{d.name}</span>
                      <span style={{fontWeight:700,fontSize:16,color:COLORS_URG[i]}}>{d.value}</span>
                    </div>
                ))}
              </div>
              <div style={{width:1,background:"var(--border)"}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:"var(--text3)",marginBottom:8,fontWeight:500}}>COMPLEXITÉ</div>
                {complexityData.map((d,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <span style={{width:10,height:10,borderRadius:3,background:["#34d399","#fbbf24","#f87171"][i]}}/>
                      <span style={{fontSize:13,flex:1}}>{d.name}</span>
                      <span style={{fontWeight:700,fontSize:16}}>{d.value}</span>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

/* ═══════════════════ SCREEN 2: EOL REPORT ═══════════════════ */
const EolScreen = () => {
  const [filterModel,setFilterModel]=useState("all");
  const [filterUrgency,setFilterUrgency]=useState("all");
  const [search,setSearch]=useState("");
  const [sortCol,setSortCol]=useState("hostname");
  const [sortDir,setSortDir]=useState("asc");

  const filtered = useMemo(()=>{
    let d = [...F];
    if(filterModel!=="all") d=d.filter(e=>e.model===filterModel);
    if(filterUrgency!=="all") d=d.filter(e=>e.lifecycle.urgency===filterUrgency);
    if(search) d=d.filter(e=>e.hostname.toLowerCase().includes(search.toLowerCase()));
    d.sort((a,b)=>{
      let va,vb;
      if(sortCol==="hostname"){va=a.hostname;vb=b.hostname;}
      else if(sortCol==="model"){va=a.model;vb=b.model;}
      else if(sortCol==="urgency"){va=a.lifecycle.urgency;vb=b.lifecycle.urgency;}
      else if(sortCol==="target"){va=a.migration.target_model;vb=b.migration.target_model;}
      else if(sortCol==="cost"){return sortDir==="asc"?a.migration.cost-b.migration.cost:b.migration.cost-a.migration.cost;}
      else{va=a[sortCol];vb=b[sortCol];}
      if(va<vb) return sortDir==="asc"?-1:1;
      if(va>vb) return sortDir==="asc"?1:-1;
      return 0;
    });
    return d;
  },[filterModel,filterUrgency,search,sortCol,sortDir]);

  const handleSort = (col)=>{if(sortCol===col)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortCol(col);setSortDir("asc");}};
  const SortIcon = ({col})=>sortCol===col?(sortDir==="asc"?"↑":"↓"):"↕";

  const selStyle={background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:10,padding:"8px 14px",color:"var(--text)",fontSize:13,outline:"none",cursor:"pointer",appearance:"none",WebkitAppearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%239898a0' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center",paddingRight:32};

  return (
      <div>
        <h1 style={{fontSize:32,fontWeight:700,marginBottom:4}}>Rapport End-of-Life</h1>
        <p style={{color:"var(--text2)",marginBottom:24}}>Statut EOL/EOS de chaque équipement du parc</p>

        {/* Filters */}
        <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap",alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un hostname..." style={{...selStyle,flex:1,minWidth:220,backgroundImage:"none",paddingRight:14}}/>
          <select value={filterModel} onChange={e=>setFilterModel(e.target.value)} style={selStyle}>
            <option value="all">Tous les modèles</option>
            <option value="Edge840">Edge 840</option>
            <option value="Edge680">Edge 680</option>
          </select>
          <select value={filterUrgency} onChange={e=>setFilterUrgency(e.target.value)} style={selStyle}>
            <option value="all">Toutes urgences</option>
            <option value="CRITICAL">CRITICAL (EoL)</option>
            <option value="HIGH">HIGH (EoS)</option>
          </select>
          <div style={{color:"var(--text3)",fontSize:13}}>{filtered.length} résultats</div>
        </div>

        {/* Table */}
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
              <tr style={{borderBottom:"1px solid var(--border)"}}>
                {[{col:"hostname",label:"Hostname"},{col:"model",label:"Modèle"},{col:"version",label:"Version"},{col:"urgency",label:"Statut"},{col:"target",label:"Cible"},{col:"cost",label:"Coût"}].map(h=>(
                    <th key={h.col} onClick={()=>handleSort(h.col)} style={{padding:"14px 16px",textAlign:"left",color:"var(--text2)",fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",userSelect:"none",fontSize:12,textTransform:"uppercase",letterSpacing:"0.5px"}}>
                      {h.label} <span style={{opacity:0.5}}><SortIcon col={h.col}/></span>
                    </th>
                ))}
                <th style={{padding:"14px 16px",textAlign:"left",color:"var(--text2)",fontWeight:600,fontSize:12,textTransform:"uppercase",letterSpacing:"0.5px"}}>EoS</th>
                <th style={{padding:"14px 16px",textAlign:"left",color:"var(--text2)",fontWeight:600,fontSize:12,textTransform:"uppercase",letterSpacing:"0.5px"}}>EoL</th>
                <th style={{padding:"14px 16px",textAlign:"left",color:"var(--text2)",fontWeight:600,fontSize:12,textTransform:"uppercase",letterSpacing:"0.5px"}}>Complexité</th>
              </tr>
              </thead>
              <tbody>
              {filtered.map((e,i)=>(
                  <tr key={e.hostname} style={{borderBottom:"1px solid var(--border)",background:i%2===0?"transparent":"rgba(255,255,255,0.01)",transition:"background 0.15s"}} onMouseEnter={ev=>ev.currentTarget.style.background="rgba(255,121,0,0.04)"} onMouseLeave={ev=>ev.currentTarget.style.background=i%2===0?"transparent":"rgba(255,255,255,0.01)"}>
                    <td style={{padding:"12px 16px",fontWeight:500}} className="mono">{e.hostname}</td>
                    <td style={{padding:"12px 16px"}}>{e.model.replace("Edge","Edge ")}</td>
                    <td style={{padding:"12px 16px"}} className="mono">{e.version}</td>
                    <td style={{padding:"12px 16px"}}><Badge urgency={e.lifecycle.urgency}/></td>
                    <td style={{padding:"12px 16px",fontWeight:600,color:"var(--orange)"}}>{e.migration.target_model}</td>
                    <td style={{padding:"12px 16px",fontWeight:600}} className="mono">{e.migration.cost}</td>
                    <td style={{padding:"12px 16px",fontSize:12,color:"var(--text3)"}} className="mono">{e.lifecycle.eos_date}</td>
                    <td style={{padding:"12px 16px",fontSize:12,color:e.lifecycle.is_eol?"var(--red)":"var(--text3)"}} className="mono">{e.lifecycle.eol_date}</td>
                    <td style={{padding:"12px 16px"}}>
                      <span style={{padding:"3px 10px",borderRadius:8,fontSize:12,fontWeight:500,background:e.migration.complexity==="Faible"?"var(--green-dim)":e.migration.complexity==="Elevee"?"var(--red-dim)":"var(--yellow-dim)",color:e.migration.complexity==="Faible"?"var(--green)":e.migration.complexity==="Elevee"?"var(--red)":"var(--yellow)"}}>{e.migration.complexity==="Elevee"?"Élevée":e.migration.complexity}</span>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

/* ═══════════════════ SCREEN 3: VERSIONS MAX ═══════════════════ */
const VersionsScreen = () => {
  const [selected,setSelected]=useState(null);
  const specs = S.reference_data.edge_7x0_specs;

  const versionGroups = useMemo(()=>{
    const groups={};
    F.forEach(e=>{
      const k=`${e.version}→${e.migration.target_model}`;
      if(!groups[k]) groups[k]={from:e.version,to:e.migration.target_model,count:0,devices:[],avgThroughput:0};
      groups[k].count++;
      groups[k].devices.push(e);
    });
    Object.values(groups).forEach(g=>{g.avgThroughput=Math.round(g.devices.reduce((s,d)=>s+d.measured.throughput_mbps,0)/g.devices.length);});
    return Object.values(groups).sort((a,b)=>b.count-a.count);
  },[]);

  return (
      <div>
        <h1 style={{fontSize:32,fontWeight:700,marginBottom:4}}>Versions Maximales</h1>
        <p style={{color:"var(--text2)",marginBottom:24}}>Version actuelle → Version max supportée & modèle cible</p>

        {/* Specs Cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:32}}>
          {specs.map(sp=>(
              <div key={sp.modele} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:24,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:sp.modele==="Edge 710"?"var(--green)":sp.modele==="Edge 720"?"var(--orange)":"var(--red)"}}/>
                <div style={{fontSize:20,fontWeight:700,marginBottom:16,color:sp.modele==="Edge 710"?"var(--green)":sp.modele==="Edge 720"?"var(--orange)":"var(--red)"}}>{sp.modele}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,fontSize:13}}>
                  <div><span style={{color:"var(--text3)"}}>Débit max</span><div style={{fontWeight:600,fontSize:16}} className="mono">{sp.debit_max_imix_mbps} Mb/s</div></div>
                  <div><span style={{color:"var(--text3)"}}>Tunnels max</span><div style={{fontWeight:600,fontSize:16}} className="mono">{sp.max_tunnels}</div></div>
                  <div><span style={{color:"var(--text3)"}}>Flows/s</span><div style={{fontWeight:600,fontSize:16}} className="mono">{sp.flows_par_seconde.toLocaleString()}</div></div>
                  <div><span style={{color:"var(--text3)"}}>Flux concurrents</span><div style={{fontWeight:600,fontSize:16}} className="mono">{sp.max_flux_concurrents.toLocaleString()}</div></div>
                  <div><span style={{color:"var(--text3)"}}>Ports SFP</span><div style={{fontWeight:600,fontSize:16}} className="mono">{sp.nb_ports_sfp}</div></div>
                  <div><span style={{color:"var(--text3)"}}>Version min</span><div style={{fontWeight:600,fontSize:14}} className="mono">5.2.2+</div></div>
                </div>
              </div>
          ))}
        </div>

        {/* Migration Flow Map */}
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>
          <h3 style={{fontSize:16,fontWeight:600,marginBottom:20,color:"var(--text2)"}}>Carte de migration — version actuelle → modèle cible</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {versionGroups.map((g,i)=>{
              const pct=Math.round(g.count/F.length*100);
              const isSelected=selected===i;
              return (
                  <div key={i}>
                    <div onClick={()=>setSelected(isSelected?null:i)} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 20px",background:isSelected?"var(--surface3)":"var(--surface2)",border:`1px solid ${isSelected?"var(--orange)":"var(--border)"}`,borderRadius:12,cursor:"pointer",transition:"all 0.2s"}}>
                      <div className="mono" style={{fontSize:14,fontWeight:600,minWidth:50,color:"var(--text)"}}>{g.from}</div>
                      <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                        <div style={{height:2,flex:1,background:`linear-gradient(90deg,var(--text3),${g.to==="Edge 710"?"var(--green)":g.to==="Edge 720"?"var(--orange)":"var(--red)"})`}}/>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill={g.to==="Edge 710"?"var(--green)":g.to==="Edge 720"?"var(--orange)":"var(--red)"}><polygon points="12,6 4,1 4,11"/></svg>
                      </div>
                      <div style={{fontWeight:700,fontSize:14,color:g.to==="Edge 710"?"var(--green)":g.to==="Edge 720"?"var(--orange)":"var(--red)",minWidth:80}}>{g.to}</div>
                      <div style={{background:"var(--surface)",borderRadius:8,padding:"4px 12px",fontSize:13,fontWeight:600}}>{g.count} <span style={{color:"var(--text3)",fontWeight:400}}>sites ({pct}%)</span></div>
                      <div style={{fontSize:12,color:"var(--text3)",minWidth:90}}>Moy. {g.avgThroughput} Mb/s</div>
                      <span style={{fontSize:12,color:"var(--text3)",transform:isSelected?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}>▼</span>
                    </div>
                    {isSelected && (
                        <div style={{marginTop:8,marginLeft:24,padding:16,background:"var(--surface2)",borderRadius:10,border:"1px solid var(--border)",maxHeight:300,overflowY:"auto"}}>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:8}}>
                            {g.devices.map(d=>(
                                <div key={d.hostname} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"var(--surface)",borderRadius:8,fontSize:12}}>
                                  <span className="mono" style={{fontWeight:500}}>{d.hostname}</span>
                                  <span style={{marginLeft:"auto",color:"var(--text3)"}}>{d.measured.throughput_mbps} Mb/s</span>
                                  {d.migration.cause && <span style={{color:"var(--orange)",fontSize:11}}>({d.migration.cause})</span>}
                                </div>
                            ))}
                          </div>
                        </div>
                    )}
                  </div>
              );
            })}
          </div>
        </div>
      </div>
  );
};

/* ═══════════════════ SCREEN 4: UPGRADE PATH ═══════════════════ */
const UpgradeScreen = () => {
  const [sourceVersion,setSourceVersion]=useState("4.2.2");
  const [selectedDevice,setSelectedDevice]=useState(null);

  const versions = [...new Set(F.map(e=>e.version))].sort();
  const paths = S.reference_data.upgrade_paths;
  const currentPath = paths.find(p=>p.version_source===sourceVersion) || paths[0];
  const steps = currentPath.etapes.split(" → ");

  const devicesForVersion = useMemo(()=>F.filter(e=>e.version===sourceVersion),[sourceVersion]);
  const totalCost = devicesForVersion.reduce((s,d)=>s+d.migration.cost,0);
  const estTimePerStep = 30; // minutes per step
  const totalTime = steps.length * estTimePerStep * devicesForVersion.length;

  const selStyle={background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 16px",color:"var(--text)",fontSize:14,outline:"none",cursor:"pointer"};

  return (
      <div>
        <h1 style={{fontSize:32,fontWeight:700,marginBottom:4}}>Upgrade Path Generator</h1>
        <p style={{color:"var(--text2)",marginBottom:24}}>Sélectionnez une version source pour générer le chemin de migration</p>

        {/* Source version selector */}
        <div style={{display:"flex",gap:16,marginBottom:32,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:24,flex:1,minWidth:300}}>
            <div style={{fontSize:13,color:"var(--text2)",marginBottom:10,fontWeight:500}}>VERSION SOURCE</div>
            <div style={{display:"flex",gap:10}}>
              {versions.map(v=>(
                  <button key={v} onClick={()=>{setSourceVersion(v);setSelectedDevice(null);}} style={{...selStyle,background:v===sourceVersion?"var(--orange)":"var(--surface2)",color:v===sourceVersion?"#000":"var(--text)",fontWeight:v===sourceVersion?700:400,border:v===sourceVersion?"1px solid var(--orange)":"1px solid var(--border)",borderRadius:10,fontSize:16,padding:"12px 24px"}} className="mono">{v}</button>
              ))}
            </div>
            <div style={{marginTop:12,fontSize:13,color:"var(--text3)"}}>{devicesForVersion.length} équipements sur cette version</div>
          </div>
          <div style={{display:"flex",gap:12}}>
            <StatCard label="Coût total" value={totalCost.toLocaleString()} color="var(--orange)" sub={`${devicesForVersion.length} devices`}/>
            <StatCard label="Étapes" value={steps.length} color="var(--blue)" sub={`~${Math.round(totalTime/60)}h total`}/>
          </div>
        </div>

        {/* Upgrade Path Visualization */}
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:32,marginBottom:24}}>
          <h3 style={{fontSize:16,fontWeight:600,marginBottom:24,color:"var(--text2)"}}>Chemin de migration</h3>
          <div style={{display:"flex",alignItems:"center",gap:0,overflowX:"auto",padding:"16px 0"}}>
            {steps.map((step,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center"}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:100}}>
                    <div style={{width:56,height:56,borderRadius:16,background:i===0?"var(--red-dim)":i===steps.length-1?"var(--green-dim)":"var(--orange-dim)",border:`2px solid ${i===0?"var(--red)":i===steps.length-1?"var(--green)":"var(--orange)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:i===0?"var(--red)":i===steps.length-1?"var(--green)":"var(--orange)"}} className="mono">{step}</div>
                    <div style={{fontSize:11,color:"var(--text3)",marginTop:8,textAlign:"center"}}>{i===0?"Actuelle":i===steps.length-1?"Cible":(`Étape ${i}`)}</div>
                    <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>~{estTimePerStep}min/device</div>
                  </div>
                  {i<steps.length-1 && (
                      <div style={{display:"flex",alignItems:"center",padding:"0 8px"}}>
                        <div style={{width:40,height:2,background:"linear-gradient(90deg, var(--orange), var(--green))"}}/>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="var(--orange)"><polygon points="10,5 3,0 3,10"/></svg>
                      </div>
                  )}
                </div>
            ))}
          </div>
          <div style={{marginTop:20,padding:"12px 16px",background:"var(--surface2)",borderRadius:10,fontSize:13,color:"var(--text2)",borderLeft:"3px solid var(--orange)"}}>
            {currentPath.notes_ordre}
          </div>
        </div>

        {/* Device list for selected version */}
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>
          <h3 style={{fontSize:16,fontWeight:600,marginBottom:16,color:"var(--text2)"}}>Équipements concernés ({devicesForVersion.length})</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:10,maxHeight:400,overflowY:"auto"}}>
            {devicesForVersion.map(d=>(
                <div key={d.hostname} onClick={()=>setSelectedDevice(selectedDevice===d.hostname?null:d.hostname)} style={{padding:"14px 18px",background:selectedDevice===d.hostname?"var(--surface3)":"var(--surface2)",border:`1px solid ${selectedDevice===d.hostname?"var(--orange)":"var(--border)"}`,borderRadius:12,cursor:"pointer",transition:"all 0.2s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:selectedDevice===d.hostname?10:0}}>
                    <span className="mono" style={{fontWeight:600,fontSize:13}}>{d.hostname}</span>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Badge urgency={d.lifecycle.urgency}/>
                      <span style={{fontWeight:700,color:"var(--orange)",fontSize:14}}>{d.migration.target_model}</span>
                    </div>
                  </div>
                  {selectedDevice===d.hostname && (
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:8,fontSize:12}}>
                        <div><span style={{color:"var(--text3)"}}>Débit</span><div className="mono" style={{fontWeight:600}}>{d.measured.throughput_mbps} Mb/s</div></div>
                        <div><span style={{color:"var(--text3)"}}>Tunnels</span><div className="mono" style={{fontWeight:600}}>{d.measured.tunnels}</div></div>
                        <div><span style={{color:"var(--text3)"}}>Flows/s</span><div className="mono" style={{fontWeight:600}}>{d.measured.flows_per_sec}</div></div>
                        <div><span style={{color:"var(--text3)"}}>BW Tier</span><div className="mono" style={{fontWeight:600}}>{d.migration.bandwidth_tier}</div></div>
                        <div><span style={{color:"var(--text3)"}}>Coût</span><div className="mono" style={{fontWeight:600,color:"var(--orange)"}}>{d.migration.cost}</div></div>
                        <div><span style={{color:"var(--text3)"}}>Complexité</span><div style={{fontWeight:600}}>{d.migration.complexity==="Elevee"?"Élevée":d.migration.complexity}</div></div>
                        {d.migration.cause && <div style={{gridColumn:"1/-1"}}><span style={{color:"var(--text3)"}}>Raison →</span> <span style={{color:"var(--orange)"}}>{d.migration.cause}</span></div>}
                        <div style={{gridColumn:"1/-1",marginTop:4}}>
                          <span style={{color:"var(--text3)"}}>Chemin: </span>
                          <span className="mono" style={{fontSize:11,color:"var(--text2)"}}>{d.migration.upgrade_path}</span>
                        </div>
                      </div>
                  )}
                </div>
            ))}
          </div>
        </div>
      </div>
  );
};

/* ═══════════════════ MAIN APP ═══════════════════ */
export default function OpalDashboard() {
  const [page, setPage] = useState("overview");

  const screens = { overview: <OverviewScreen/>, network: <NetworkScreen/>, eol: <EolScreen/>, versions: <VersionsScreen/>, upgrade: <UpgradeScreen/> };

  return (
      <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex"}}>
        <style>{css}</style>

        {/* Sidebar */}
        <div style={{width:240,background:"var(--surface)",borderRight:"1px solid var(--border)",padding:"16px 0",display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",flexShrink:0}}>
          {/* Logo */}
          <div style={{padding:"0 16px",height:60,display:"flex",alignItems:"center",borderBottom:"1px solid var(--border)"}}>
            <img src={logo} alt="Orange Business x Opal" style={{maxHeight:"400px",maxWidth:"100%",objectFit:"contain"}} />
          </div>

          {/* Nav */}
          <div style={{padding:"10px 10px",flex:1}}>
            {navItems.map(n=>(
                <button key={n.id} onClick={()=>setPage(n.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",borderRadius:10,border:"none",background:page===n.id?"var(--orange-dim)":"transparent",color:page===n.id?"var(--orange)":"var(--text2)",fontSize:13,fontWeight:page===n.id?600:400,cursor:"pointer",marginBottom:2,textAlign:"left",transition:"all 0.2s",fontFamily:"inherit"}}>
                  {n.icon && <span style={{fontSize:16}}>{n.icon}</span>}{n.label}
                </button>
            ))}
          </div>

          {/* Footer */}
          <div style={{padding:"12px 16px",borderTop:"1px solid var(--border)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,var(--orange),var(--orange2))",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13}}>A</div>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>Admin</div>
                <div style={{fontSize:11,color:"var(--text3)"}}>Gérer</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{flex:1,padding:"32px 40px",overflowY:"auto",maxHeight:"100vh"}}>
          {screens[page]}
        </div>
      </div>
  );
}