import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class VisitorScreen extends StatefulWidget {
  final String userId;
  final String roomNumber;

  const VisitorScreen({
    super.key,
    this.userId = '',
    this.roomNumber = '',
  });

  @override
  State<VisitorScreen> createState() => _VisitorScreenState();
}

class _VisitorScreenState extends State<VisitorScreen> {
  final _formKey = GlobalKey<FormState>();
  final String _backendUrl = 'http://10.0.2.2:3000';

  // ตัวแปรเก็บค่าฟอร์ม
  final _nameController = TextEditingController();
  final _plateController = TextEditingController();
  final _purposeController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _nameController.dispose();
    _plateController.dispose();
    _purposeController.dispose();
    super.dispose();
  }

  void _submitVisitorCheckIn() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isSubmitting = true);

      try {
        // เรียก Backend API /api/visitors/check-in
        final response = await http.post(
          Uri.parse('$_backendUrl/api/visitors/check-in'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'visitorName': _nameController.text.trim(),
            'plateNumber': _plateController.text.trim().toUpperCase(),
            'contactRoom': widget.roomNumber,
            'purpose': _purposeController.text.trim(),
          }),
        );

        final data = jsonDecode(response.body);

        if (mounted) {
          setState(() => _isSubmitting = false);

          if (response.statusCode == 201) {
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
                    const Icon(
                      Icons.check_circle,
                      color: Colors.green,
                      size: 64,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'ลงทะเบียนเข้าสำเร็จ',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'ผู้มาติดต่อ ${_nameController.text} ได้รับการบันทึกเข้าแล้ว',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.grey),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context); // ปิด Pop-up
                          // ล้างฟอร์ม
                          _nameController.clear();
                          _plateController.clear();
                          _purposeController.clear();
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
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(data['error'] ?? 'เกิดข้อผิดพลาด')),
            );
          }
        }
      } catch (e) {
        if (mounted) {
          setState(() => _isSubmitting = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('ไม่สามารถเชื่อมต่อ Server ได้: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: const Text(
          'ลงทะเบียนผู้มาติดต่อ',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- ส่วนคำอธิบาย ---
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue[200]!),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline, color: Colors.blue[700]),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'ลงทะเบียนผู้มาติดต่อ',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'กรุณากรอกข้อมูลผู้มาติดต่อเพื่อการรักษาความปลอดภัยของคอนโดมิเนียม',
                          style: TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // --- ฟอร์ม ---
            Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ชื่อผู้มาติดต่อ
                  const Text(
                    'ชื่อผู้มาติดต่อ *',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _nameController,
                    decoration: InputDecoration(
                      hintText: 'เช่น สมชายดี ยืนยิ่ง',
                      filled: true,
                      fillColor: Colors.grey[100],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'กรุณากรอกชื่อผู้มาติดต่อ';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),

                  // ทะเบียนรถ
                  const Text(
                    'ทะเบียนรถ *',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _plateController,
                    decoration: InputDecoration(
                      hintText: 'เช่น กท 1234',
                      filled: true,
                      fillColor: Colors.grey[100],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    textCapitalization: TextCapitalization.characters,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'กรุณากรอกทะเบียนรถ';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),

                  // ห้องที่ติดต่อ (Read-only)
                  const Text(
                    'ห้องที่ติดต่อ',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    initialValue: widget.roomNumber,
                    readOnly: true,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: Colors.grey[200],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // วัตถุประสงค์
                  const Text(
                    'วัตถุประสงค์',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _purposeController,
                    decoration: InputDecoration(
                      hintText: 'เช่น ส่งของ, ซ่อมแซม',
                      filled: true,
                      fillColor: Colors.grey[100],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),

                  // ปุ่มส่ง
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitVisitorCheckIn,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue[700],
                        disabledBackgroundColor: Colors.grey[400],
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.white,
                                ),
                              ),
                            )
                          : const Text(
                              'ลงทะเบียนเข้า',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
