import { useState } from "react";
import { Download, FileJson, Upload, Settings, Copy } from "lucide-react";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export default function CSVtoJSONConverter() {
  const [csvData, setCsvData] = useState<string>("");
  const [jsonData, setJsonData] = useState<string>("");
  const [fileName, setFileName] = useState<string>("data");
  const [parseNested, setParseNested] = useState<boolean>(true);

  const isValidJSON = (str: string): boolean => {
    if (typeof str !== "string") return false;
    if (!str.trim()) return false;
    const trimmed = str.trim();
    if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return false;

    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const parseValue = (value: string): JsonValue => {
    if (value === "\\N" || value === "NULL" || value === "") return null;
    if (parseNested && isValidJSON(value)) {
      try {
        return JSON.parse(value);
      } catch {}
    }
    if (!isNaN(Number(value)) && value.trim() !== "") {
      return value.includes(".") ? parseFloat(value) : parseInt(value, 10);
    }
    return value;
  };

  const parseCSV = (csv: string): Record<string, JsonValue>[] => {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].split("\t").map((h) => h.trim());
    const results: Record<string, JsonValue>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split("\t");
      const obj: Record<string, JsonValue> = {};
      headers.forEach((header, index) => {
        obj[header] = parseValue(values[index] || "");
      });
      results.push(obj);
    }

    return results;
  };

  const handleConvert = (): void => {
    if (!csvData.trim()) {
      alert("Vui lòng nhập dữ liệu CSV");
      return;
    }
    const parsed = parseCSV(csvData);
    setJsonData(JSON.stringify(parsed, null, 2));
  };

  const handleDownload = (): void => {
    if (!jsonData) {
      alert("Chưa có dữ liệu JSON để tải xuống");
      return;
    }
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async (): Promise<void> => {
    if (!jsonData) return;
    try {
      await navigator.clipboard.writeText(jsonData);
      alert("Đã copy JSON vào clipboard!");
    } catch {
      alert("Copy thất bại!");
    }
  };

  const sampleData: Record<string, string> = {
    loyalty_transactions: `id	code	loyalty_id	order_id	type_transaction	loyalty_data	point_before	point_after	point_amount	customer_id	order_ref_id	create_date
242837	ADD1234567890	1	\\N	1	{"id":1,"name":"Basic","from_point":0,"to_point":4999,"status":1}	0	0	0	300001	1000000001	2024-06-23 17:49:23
256311	ADD9876543210	1	\\N	1	{"id":1,"name":"Basic","from_point":0,"to_point":4999,"status":1}	0	318	318	300001	1000000002	2024-07-07 19:14:45`,

    orders: `id	code	loyalty_id	customer_id	phone_number	status	payment_status	total_amount	tags	created_at
500001	ORD10001	1	300001	0900000001	completed	paid	380000.00	["TAG01"]	2024-09-04 15:32:58
500002	ORD10002	1	300001	0900000002	completed	paid	199000.00	[]	2024-09-04 10:34:49`,

    customers: `id	customer_shop_id	loyalty_id	name	code	phone	point	customer_groups	created_at
300001	\\N	4	Nguyễn Văn A	CUST1001	0900000003	33121	{"vip":true,"segment":"gold"}	2024-12-13 12:47:57`,

    mixed_data: `id	name	metadata	price	tags	active
1	Product A	{"color":"red","size":"M","specs":{"weight":100}}	299000	["new","sale"]	1
2	Product B	{"color":"blue","size":"L"}	450000	["featured"]	0`,
  };

  const loadSample = (tableName: string): void => {
    setCsvData(sampleData[tableName]);
    setFileName(tableName);
  };

  const recordCount = jsonData ? (JSON.parse(jsonData) as unknown[]).length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileJson className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">
                CSV to JSON Converter
              </h1>
            </div>
            <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-lg">
              <Settings className="w-5 h-5 text-indigo-600" />
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={parseNested}
                  onChange={(e) => setParseNested(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
                Parse Nested JSON
              </label>
            </div>
          </div>

          {/* File name input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên file xuất
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Nhập tên file..."
            />
          </div>

          {/* Sample data buttons */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dữ liệu mẫu
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(sampleData).map((table) => (
                <button
                  key={table}
                  onClick={() => loadSample(table)}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                >
                  {table}
                </button>
              ))}
            </div>
          </div>

          {/* Input/Output */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* CSV Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                CSV Input (Tab-separated)
              </label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Dán dữ liệu CSV vào đây (phân tách bằng tab)..."
              />
            </div>

            {/* JSON Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  JSON Output
                </label>
                {jsonData && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {recordCount} records
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                )}
              </div>
              <textarea
                value={jsonData}
                readOnly
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 resize-none"
                placeholder="Kết quả JSON sẽ hiển thị ở đây..."
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleConvert}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md"
            >
              <Upload className="w-5 h-5" />
              Chuyển đổi
            </button>
            <button
              onClick={handleDownload}
              disabled={!jsonData}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Tải xuống JSON
            </button>
            <button
              onClick={() => {
                setCsvData("");
                setJsonData("");
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
