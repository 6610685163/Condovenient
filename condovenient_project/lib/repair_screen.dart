import 'package:flutter/material.dart';

class RepairScreen extends StatefulWidget {
  const RepairScreen({super.key});

  @override
  State<RepairScreen> createState() => _RepairScreenState();
}

class _RepairScreenState extends State<RepairScreen> {
  final _formKey = GlobalKey<FormState>();

  // ตัวแปรเก็บค่าฟอร์ม
  String? _selectedCategory;
  final _titleController = TextEditingController();
  final _descController = TextEditingController();

  // จำลองว่าเลือกรูปภาพแล้วหรือยัง (เพื่อเปลี่ยน UI)
  bool _hasImage = false;
  bool _isSubmitting = false;

  final List<String> _categories = [
    'ไฟฟ้า / แสงสว่าง',
    'ประปา / ท่อน้ำ',
    'เครื่องปรับอากาศ',
    'โครงสร้าง / ผนัง / เพดาน',
    'อินเทอร์เน็ต / เคเบิล',
    'อื่นๆ',
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  void _submitRepair() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isSubmitting = true);

      // จำลองการส่งข้อมูลไป Backend 2 วินาที
      await Future.delayed(const Duration(seconds: 2));

      if (mounted) {
        setState(() => _isSubmitting = false);

        // โชว์ Pop-up สำเร็จ
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle, color: Colors.green, size: 64),
                const SizedBox(height: 16),
                const Text(
                  'ส่งเรื่องแจ้งซ่อมสำเร็จ',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  'ช่างจะติดต่อกลับไปภายใน 24 ชั่วโมง',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context); // ปิด Pop-up
                      // ล้างฟอร์ม
                      _titleController.clear();
                      _descController.clear();
                      setState(() {
                        _selectedCategory = null;
                        _hasImage = false;
                      });
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue[700],
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text(
                      'ตกลง',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: const Text(
          'แจ้งซ่อม (Report Repair)',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // --- 1. หมวดหมู่ ---
              const Text(
                'หมวดหมู่ปัญหา',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 16,
                  ),
                ),
                hint: const Text('เลือกหมวดหมู่ที่ต้องการแจ้งซ่อม'),
                items: _categories.map((category) {
                  return DropdownMenuItem(
                    value: category,
                    child: Text(category),
                  );
                }).toList(),
                onChanged: (value) => setState(() => _selectedCategory = value),
                validator: (value) =>
                    value == null ? 'กรุณาเลือกหมวดหมู่' : null,
              ),
              const SizedBox(height: 20),

              // --- 2. หัวข้อ ---
              const Text(
                'หัวข้อ',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _titleController,
                decoration: InputDecoration(
                  hintText: 'เช่น แอร์น้ำหยด, หลอดไฟห้องน้ำขาด',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
                validator: (value) => value!.isEmpty ? 'กรุณาระบุหัวข้อ' : null,
              ),
              const SizedBox(height: 20),

              // --- 3. รายละเอียด ---
              const Text(
                'รายละเอียดเพิ่มเติม',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _descController,
                maxLines: 4,
                decoration: InputDecoration(
                  hintText:
                      'อธิบายลักษณะอาการ หรือช่วงเวลาที่สะดวกให้ช่างเข้าประเมิน',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // --- 4. อัปโหลดรูปภาพ (UI จำลอง) ---
              const Text(
                'รูปภาพประกอบ',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () {
                  // สลับสถานะเพื่อโชว์ UI รูปภาพจำลอง
                  setState(() => _hasImage = !_hasImage);
                },
                child: Container(
                  height: 150,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _hasImage ? Colors.blue : Colors.grey.shade300,
                      width: 2,
                    ),
                    // ถ้ารูปมีให้โชว์รูปจำลอง (ดึงจากเน็ต)
                    image: _hasImage
                        ? const DecorationImage(
                            image: NetworkImage(
                              'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=300&auto=format&fit=crop',
                            ),
                            fit: BoxFit.cover,
                          )
                        : null,
                  ),
                  child: !_hasImage
                      ? Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.add_a_photo_outlined,
                              size: 40,
                              color: Colors.blue[400],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'แตะเพื่อถ่ายรูปหรืออัปโหลด',
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 14,
                              ),
                            ),
                          ],
                        )
                      : Container(
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.4),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Center(
                            child: Icon(
                              Icons.refresh,
                              color: Colors.white,
                              size: 40,
                            ),
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 32),

              // --- 5. ปุ่ม Submit ---
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitRepair,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue[700],
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: _isSubmitting
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text(
                          'ส่งเรื่องแจ้งซ่อม',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
