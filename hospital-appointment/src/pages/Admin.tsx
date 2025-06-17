import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { patientService } from '../services/patientService'
import { doctorService } from '../services/doctorService';
import { specializationService } from '../services/specializationService';
import { hospitalService } from '../services/hospitalService';
import { cloudinaryService } from '../services/cloudinaryService';
import '../styles/Admin.css';
import logoImage from '../assets/logo.png';
import { doctorResponse, Patient, Appointment } from '../types/api';
import { appointmentService } from '../services/appointmentService';
import { Hospital } from '../types/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Specialization {
    id: number;
    name: string;
    description: string;
}

const Admin: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('patients');
    const [showHospitalModal, setShowHospitalModal] = useState(false);
    const [showHospitalDetailModal, setShowHospitalDetailModal] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [doctors, setDoctors] = useState<doctorResponse[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hospitalForm, setHospitalForm] = useState({
        name: '',
        address: '',
        phone: '',
        image: null as File | null
    });
    const [showAddSpecializationModal, setShowAddSpecializationModal] = useState(false);
    const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
    const [specializationForm, setSpecializationForm] = useState({
        name: ''
    });
    const [doctorForm, setDoctorForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        experience: '',
        about: '',
        specialization: '',
        image: null as File | null,
        gender: 'MALE',
        dateOfBirth: '',
        address: '',
        hospital_id: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const [filteredSpecializations, setFilteredSpecializations] = useState<Specialization[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<doctorResponse[]>([]);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [appointmentsPerPage] = useState(6);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [appointmentFilters, setAppointmentFilters] = useState({
        doctor: '',
        patient: '',
        date: '',
        status: ''
    });
    const [hospitalSearchTerm, setHospitalSearchTerm] = useState('');
    const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [appointmentStats, setAppointmentStats] = useState({
        CANCELLED: 0,
        COMPLETED: 0
    });
    const [dateRange, setDateRange] = useState(() => {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return {
            startDate: startOfYear.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
        };
    });
    const [hospitalStats, setHospitalStats] = useState<{ hospitalName: string; count: number }[]>([]);
    const [doctorStats, setDoctorStats] = useState<{
        doctorName: string;
        cancelled: number;
        completed: number;
    }[]>([]);
    const [revisitStats, setRevisitStats] = useState<{ revisitRate: string; daysWindow: number }>({ revisitRate: '0%', daysWindow: 0 });
    const [showDoctorActionModal, setShowDoctorActionModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<doctorResponse | null>(null);
    const [showEditHospitalModal, setShowEditHospitalModal] = useState(false);
    const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
    const [editHospitalForm, setEditHospitalForm] = useState({
        name: '',
        address: '',
        phone: '',
        avatarUrl: ''
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showEditDoctorModal, setShowEditDoctorModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState<doctorResponse | null>(null);
    const [editDoctorForm, setEditDoctorForm] = useState({
        name: '',
        email: '',
        phone: '',
        gender: 'MALE',
        dateOfBirth: '',
        address: '',
        specialization_id: 0,
        avatarUrl: '',
        yearsOfExperience: 0
    });

    // Calculate hospital statistics
    const totalHospitals = hospitals.length;

    useEffect(() => {
        const checkAccess = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Nếu có user data trong localStorage thì không phải admin
            const userData = localStorage.getItem('user');
            if (userData) {
                showNotification('Bạn không có quyền truy cập trang này!', 'error');
                navigate('/home');
                return;
            }

            // Nếu chỉ có token và không có user data thì là admin
            // Không cần làm gì cả, cho phép truy cập
        };

        checkAccess();
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'hospitals') {
            fetchHospitals();
        }
    }, [activeTab]);

    useEffect(() => {
        if (selectedHospital) {
            setFilteredSpecializations(specializations);
            console.log(doctors);
            setFilteredDoctors(doctors);
        }
    }, [specializations, doctors, selectedHospital]);

    useEffect(() => {
        if (activeTab === 'patients') {
            fetchPatients();
        }
    }, [activeTab]);

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        let filtered = appointments;

        if (appointmentFilters.doctor) {
            filtered = filtered.filter(app =>
                app.doctor_name.toLowerCase().includes(appointmentFilters.doctor.toLowerCase())
            );
        }

        if (appointmentFilters.patient) {
            filtered = filtered.filter(app =>
                app.patient_name.toLowerCase().includes(appointmentFilters.patient.toLowerCase())
            );
        }

        if (appointmentFilters.date) {
            filtered = filtered.filter(app =>
                app.appointmentDate.includes(appointmentFilters.date)
            );
        }

        if (appointmentFilters.status) {
            filtered = filtered.filter(app =>
                app.status === appointmentFilters.status
            );
        }

        setFilteredAppointments(filtered);
        setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
    }, [appointments, appointmentFilters]);

    useEffect(() => {
        if (hospitalSearchTerm) {
            const filtered = hospitals.filter(hospital =>
                hospital.name.toLowerCase().includes(hospitalSearchTerm.toLowerCase())
            );
            setFilteredHospitals(filtered);
        } else {
            setFilteredHospitals(hospitals);
        }
    }, [hospitalSearchTerm, hospitals]);

    useEffect(() => {
        if (patientSearchTerm) {
            const filtered = patients.filter(patient =>
                patient.user.email.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                patient.user.phone.toLowerCase().includes(patientSearchTerm.toLowerCase())
            );
            setFilteredPatients(filtered);
        } else {
            setFilteredPatients(patients);
        }
    }, [patientSearchTerm, patients]);

    useEffect(() => {
        if (activeTab === 'statistics') {
            fetchAppointmentStats();
            fetchHospitalStats();
            fetchDoctorStats();
            fetchRevisitStats();
        }
    }, [activeTab, dateRange]);

    const fetchHospitals = async () => {
        try {
            setIsLoading(true);
            const response = await hospitalService.getAllHospitals();
            setHospitals(response);
        } catch (error) {
            console.error('Error fetching hospitals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            setIsLoading(true);
            const data = await patientService.getAllPatients();
            setPatients(data);
        } catch (error) {
            console.error('Error fetching patients:', error);
            showNotification('Không thể tải danh sách bệnh nhân', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await appointmentService.getAppointmentsByAdmin();
            setAppointments(response);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            showNotification('Không thể tải danh sách cuộc hẹn', 'error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    const handleHospitalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!hospitalForm.image) {
                showNotification('Vui lòng chọn ảnh bệnh viện', 'error');
                return;
            }

            // Upload ảnh lên Cloudinary
            const avatarUrl = await cloudinaryService.uploadImage(hospitalForm.image, 'Hospital');

            // Tạo bệnh viện mới với URL ảnh đã upload
            const hospitalData = {
                avatarUrl,
                name: hospitalForm.name,
                address: hospitalForm.address,
                phone: hospitalForm.phone
            };

            await hospitalService.addHospital(hospitalData);

            // Đóng modal và reset form
            setShowHospitalModal(false);
            setHospitalForm({ name: '', address: '', phone: '', image: null });

            // Refresh danh sách bệnh viện
            fetchHospitals();
        } catch (error) {
            console.error('Error adding hospital:', error);
            showNotification('Có lỗi xảy ra khi thêm bệnh viện', 'error');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setHospitalForm(prev => ({
                ...prev,
                image: e.target.files![0]
            }));
        }
    };

    const handleHospitalClick = async (hospital: Hospital) => {
        setSelectedHospital(hospital);
        setShowHospitalDetailModal(true);
        try {
            const [specializationsData, doctorsData] = await Promise.all([
                specializationService.getAllSpecializations(hospital.id.toString()),
                doctorService.getDoctorsByHospital(hospital.id)
            ]);
            setSpecializations(specializationsData);
            setDoctors(doctorsData);
        } catch (error) {
            console.error('Error fetching hospital details:', error);
            showNotification('Không thể tải thông tin bệnh viện', 'error');
        }
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    const resetSpecializationForm = () => {
        setSpecializationForm({ name: '' });
        setSearchTerm('');
    };

    const handleCloseSpecializationModal = () => {
        setShowAddSpecializationModal(false);
        resetSpecializationForm();
    };

    const handleAddSpecialization = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await specializationService.addSpecialization({
                name: specializationForm.name,
                hospital_id: selectedHospital?.id.toString() || ''
            });

            if (response === "success") {
                showNotification('Thêm chuyên khoa thành công', 'success');
                setShowAddSpecializationModal(false);
                resetSpecializationForm();
                // Refresh danh sách chuyên khoa
                if (selectedHospital) {
                    const specializations = await specializationService.getAllSpecializations(selectedHospital.id.toString());
                    setSpecializations(specializations);
                }
            }
        } catch (error: any) {
            console.error('Error adding specialization:', error);
            if (error.response?.data?.message === "Specialization already exists") {
                showNotification('Chuyên khoa này đã tồn tại', 'error');
            } else {
                showNotification('Có lỗi xảy ra khi thêm chuyên khoa', 'error');
            }
        }
    };

    const handleDoctorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setDoctorForm(prev => ({
                ...prev,
                image: file
            }));
            // Tạo URL preview cho ảnh
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetDoctorForm = () => {
        setDoctorForm({
            name: '',
            email: '',
            password: '',
            phone: '',
            experience: '',
            about: '',
            specialization: '',
            image: null,
            gender: 'MALE',
            dateOfBirth: '',
            address: '',
            hospital_id: ''
        });
        setPreviewImage(null);
        // Reset file input
        const fileInput = document.getElementById('doctorImage') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleAddDoctor = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!selectedHospital) {
                showNotification('Vui lòng chọn bệnh viện', 'error');
                return;
            }

            if (!doctorForm.image) {
                showNotification('Vui lòng chọn ảnh bác sĩ', 'error');
                return;
            }

            // Upload ảnh lên Cloudinary
            const avatarUrl = await cloudinaryService.uploadImage(doctorForm.image, 'Doctor');

            // Thêm bác sĩ mới
            await doctorService.addDoctor({
                registerRequest: {
                    name: doctorForm.name,
                    email: doctorForm.email,
                    password: doctorForm.password,
                    phone: doctorForm.phone,
                    gender: doctorForm.gender,
                    dateOfBirth: doctorForm.dateOfBirth,
                    avatarUrl,
                    address: doctorForm.address
                },
                about: doctorForm.about,
                specialization_id: parseInt(doctorForm.specialization),
                yearsOfExperience: parseInt(doctorForm.experience),
                hospital_id: selectedHospital.id
            });

            showNotification('Thêm bác sĩ thành công', 'success');
            setShowAddDoctorModal(false);
            resetDoctorForm();

            // Refresh danh sách bác sĩ
            if (selectedHospital) {
                const doctorsData = await doctorService.getDoctorsByHospital(selectedHospital.id);
                setDoctors(doctorsData);
            }
        } catch (error) {
            console.error('Error adding doctor:', error);
            showNotification('Có lỗi xảy ra khi thêm bác sĩ', 'error');
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearchTerm(searchTerm);

        if (selectedHospital) {
            if (!searchTerm) {
                setFilteredSpecializations(specializations);
            } else {
                const filtered = specializations.filter(spec =>
                    spec.name.toLowerCase().includes(searchTerm)
                );
                setFilteredSpecializations(filtered);
            }
        }
    };

    const handleDoctorSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setDoctorSearchTerm(searchTerm);
        filterDoctors(searchTerm, selectedSpecialization);
    };

    const handleSpecializationFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const specialization = e.target.value;
        setSelectedSpecialization(specialization);
        filterDoctors(doctorSearchTerm, specialization);
    };

    const filterDoctors = (searchTerm: string, specialization: string) => {
        if (selectedHospital) {
            let filtered = doctors;

            // Lọc theo tên
            if (searchTerm) {
                filtered = filtered.filter(doctor =>
                    doctor.name.toLowerCase().includes(searchTerm)
                );
            }

            // Lọc theo chuyên khoa
            if (specialization) {
                filtered = filtered.filter(doctor =>
                    doctor.specialization_name === specialization
                );
            }

            setFilteredDoctors(filtered);
        }
    };

    const handleTogglePatientStatus = async (patientId: number, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = currentStatus ?
                `http://localhost:8801/api/patient/ban?patient_id=${patientId}` :
                `http://localhost:8801/api/patient/unban?patient_id=${patientId}`;

            await axios.put(endpoint, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Refresh danh sách patients sau khi ban/unban
            await fetchPatients();
            showNotification(`Đã ${currentStatus ? 'khóa' : 'mở khóa'} tài khoản thành công`, 'success');
        } catch (error) {
            console.error('Error toggling patient status:', error);
            showNotification('Có lỗi xảy ra khi thay đổi trạng thái tài khoản', 'error');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Tính toán số trang và danh sách bệnh nhân cho trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPatients = patients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const renderPagination = () => {
        if (filteredPatients.length === 0) return null;

        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="pagination">
                <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    &laquo;
                </button>
                {pageNumbers.map(number => (
                    <button
                        key={number}
                        className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                        onClick={() => handlePageChange(number)}
                    >
                        {number}
                    </button>
                ))}
                <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    &raquo;
                </button>
            </div>
        );
    };

    // Tính toán số trang và danh sách cuộc hẹn cho trang hiện tại
    const indexOfLastAppointment = currentPage * appointmentsPerPage;
    const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
    const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
    const totalAppointmentPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

    const handleAppointmentPageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAppointmentFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatDateTime = (date: string, time: string) => {
        const dateObj = new Date(date);
        return `${dateObj.toLocaleDateString('vi-VN')} ${time.slice(0, 5)}`;
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xác nhận';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'CANCELLED':
                return 'Đã hủy';
            case 'COMPLETED':
                return 'Đã hoàn thành';
            default:
                return status;
        }
    };

    const handleAppointmentStatus = async (appointmentId: number, newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
        try {
            let successMessage = '';
            switch (newStatus) {
                case 'CONFIRMED':
                    await appointmentService.confirmAppointment(appointmentId);
                    successMessage = 'Đã xác nhận cuộc hẹn';
                    break;
                case 'CANCELLED':
                    await appointmentService.cancelAppointment(appointmentId);
                    successMessage = 'Đã hủy cuộc hẹn';
                    break;
                case 'COMPLETED':
                    await appointmentService.completeAppointment(appointmentId);
                    successMessage = 'Đã hoàn thành cuộc hẹn';
                    break;
            }
            showNotification(successMessage, 'success');
            fetchAppointments();
        } catch (error) {
            console.error('Error updating appointment status:', error);
            showNotification('Có lỗi xảy ra khi cập nhật trạng thái cuộc hẹn', 'error');
        }
    };

    const fetchAppointmentStats = async () => {
        try {
            const stats = await appointmentService.getCountAppointment(dateRange.startDate, dateRange.endDate);
            setAppointmentStats(stats);
        } catch (error) {
            console.error('Error fetching appointment stats:', error);
            showNotification('Không thể tải thống kê cuộc hẹn', 'error');
        }
    };

    const fetchHospitalStats = async () => {
        try {
            const stats = await appointmentService.getCountAppointmentHospital(dateRange.startDate, dateRange.endDate);
            console.log('Hospital stats:', stats); // Debug log
            // Convert object to array of { hospitalName, count }
            const statsArray = Object.entries(stats).map(([hospitalName, count]) => ({
                hospitalName,
                count
            }));
            setHospitalStats(statsArray);
        } catch (error) {
            console.error('Error fetching hospital stats:', error);
            showNotification('Không thể tải thống kê theo bệnh viện', 'error');
            setHospitalStats([]);
        }
    };

    const fetchDoctorStats = async () => {
        try {
            const stats = await appointmentService.getCountAppointmentDoctor(dateRange.startDate, dateRange.endDate);
            setDoctorStats(stats);
        } catch (error) {
            console.error('Error fetching doctor stats:', error);
            showNotification('Không thể tải thống kê theo bác sĩ', 'error');
            setDoctorStats([]);
        }
    };

    const fetchRevisitStats = async () => {
        try {
            const data = await appointmentService.getRevisitRate();
            setRevisitStats(data);
        } catch (error) {
            console.error('Error fetching revisit stats:', error);
            notification.error({
                message: 'Lỗi',
                description: 'Không thể lấy thống kê tỉ lệ tái khám',
            });
        }
    };

    const handleToggleDoctorStatus = async (doctor: doctorResponse) => {
        try {
            let response;
            if (doctor.enabled) {
                response = await doctorService.banDoctor(doctor.id);
            } else {
                response = await doctorService.unbanDoctor(doctor.id);
            }

            if (response) {
                // Cập nhật lại danh sách bác sĩ
                const updatedDoctors = filteredDoctors.map(d =>
                    d.id === doctor.id ? { ...d, enabled: !d.enabled } : d
                );
                setFilteredDoctors(updatedDoctors);
                setNotification({
                    message: doctor.enabled ? 'Đã khóa bác sĩ thành công' : 'Đã mở khóa bác sĩ thành công',
                    type: 'success'
                });
                // Tự động ẩn thông báo sau 3 giây
                setTimeout(() => {
                    setNotification(null);
                }, 3000);
            }
        } catch (error) {
            console.error('Error updating doctor status:', error);
            setNotification({
                message: 'Có lỗi xảy ra khi thực hiện thao tác',
                type: 'error'
            });
            // Tự động ẩn thông báo lỗi sau 3 giây
            setTimeout(() => {
                setNotification(null);
            }, 3000);
        }
    };

    const handleOpenEditHospital = (hospital: Hospital) => {
        setEditingHospital(hospital);
        setEditHospitalForm({
            name: hospital.name,
            address: hospital.address,
            phone: hospital.phone,
            avatarUrl: hospital.avatarUrl || ''
        });
        setShowEditHospitalModal(true);
    };

    const handleCloseEditHospital = () => {
        setShowEditHospitalModal(false);
        setEditingHospital(null);
        setEditHospitalForm({
            name: '',
            address: '',
            phone: '',
            avatarUrl: ''
        });
        setImagePreview(null);
        setSelectedFile(null);
    };

    const handleEditHospitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditHospitalForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveHospital = async () => {
        if (!editingHospital) return;

        try {
            let avatarUrl = editHospitalForm.avatarUrl;

            // Nếu có file ảnh mới được chọn
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('upload_preset', 'Hospital');

                const uploadResponse = await axios.post(
                    `https://api.cloudinary.com/v1_1/di53bdbjf/image/upload`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                avatarUrl = uploadResponse.data.secure_url;
            }

            const hospitalData = {
                id: editingHospital.id.toString(),
                ...editHospitalForm,
                avatarUrl
            };

            const response = await hospitalService.updateHospital(hospitalData);

            if (response === "update success") {
                setNotification({
                    type: 'success',
                    message: 'Cập nhật thông tin bệnh viện thành công'
                });

                // Cập nhật lại danh sách bệnh viện
                const updatedHospitals = hospitals.map(h =>
                    h.id === editingHospital.id ? { ...h, ...hospitalData } : h
                );
                setHospitals(updatedHospitals);

                // Đóng modal trước
                handleCloseEditHospital();

                // Reset form sau
                setEditHospitalForm({
                    name: '',
                    address: '',
                    phone: '',
                    avatarUrl: ''
                });
                setImagePreview(null);
                setSelectedFile(null);
            } else {
                setNotification({
                    type: 'error',
                    message: 'Cập nhật thông tin bệnh viện thất bại'
                });
            }

            // Ẩn thông báo sau 3 giây
            setTimeout(() => {
                setNotification(null);
            }, 3000);
        } catch (error) {
            console.error('Error updating hospital:', error);
            setNotification({
                type: 'error',
                message: 'Cập nhật thông tin bệnh viện thất bại'
            });
            // Ẩn thông báo sau 3 giây
            setTimeout(() => {
                setNotification(null);
            }, 3000);
        }
    };

    const handleToggleHospitalStatus = async (hospital: Hospital) => {
        try {
            let response;
            if (hospital.enabled) {
                response = await hospitalService.banHospital(hospital.id);
            } else {
                response = await hospitalService.unbanHospital(hospital.id);
            }

            if (response) {
                // Cập nhật lại danh sách bệnh viện
                const updatedHospitals = hospitals.map(h =>
                    h.id === hospital.id ? { ...h, enabled: !h.enabled } : h
                );
                setHospitals(updatedHospitals);

                setNotification({
                    type: 'success',
                    message: hospital.enabled ? 'Đã khóa bệnh viện thành công' : 'Đã mở khóa bệnh viện thành công'
                });

                // Tự động ẩn thông báo sau 3 giây
                setTimeout(() => {
                    setNotification(null);
                }, 3000);
            }
        } catch (error) {
            console.error('Error updating hospital status:', error);
            setNotification({
                type: 'error',
                message: 'Có lỗi xảy ra khi thực hiện thao tác'
            });
            // Tự động ẩn thông báo lỗi sau 3 giây
            setTimeout(() => {
                setNotification(null);
            }, 3000);
        }
    };

    const handleOpenEditDoctor = (doctor: doctorResponse) => {
        console.log(specializations);
        console.log(doctor.specialization_name);
        const matched = specializations.find(
            spec =>
                spec.name?.trim().toLowerCase() ===
                doctor.specialization_name?.trim().toLowerCase()
        );
        console.log("Matched specialization:", matched?.id);
        setEditingDoctor(doctor);
        console.log(doctor.id);
        setEditDoctorForm({
            name: doctor.name,
            email: doctor.email,
            phone: doctor.phone,
            gender: doctor.gender,
            dateOfBirth: doctor.dateOfBirth,
            address: doctor.address,
            specialization_id: matched?.id || 0,
            avatarUrl: doctor.avatarUrl,
            yearsOfExperience: doctor.yearsOfExperience || 0
        });
        setShowEditDoctorModal(true);
    };

    const handleCloseEditDoctor = () => {
        setShowEditDoctorModal(false);
        setEditingDoctor(null);
        setEditDoctorForm({
            name: '',
            email: '',
            phone: '',
            gender: 'MALE',
            dateOfBirth: '',
            address: '',
            specialization_id: 0,
            avatarUrl: '',
            yearsOfExperience: 0
        });
    };

    const handleEditDoctorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditDoctorForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditDoctorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditDoctorForm(prev => ({
                    ...prev,
                    avatarUrl: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveDoctor = async () => {
        if (!editingDoctor) return;

        try {
            let avatarUrl = editDoctorForm.avatarUrl;

            // Nếu có file ảnh mới được chọn
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('upload_preset', 'Doctor');

                const uploadResponse = await axios.post(
                    `https://api.cloudinary.com/v1_1/di53bdbjf/image/upload`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                avatarUrl = uploadResponse.data.secure_url;
            }

            const doctorData = {
                id: parseInt(editingDoctor.id),
                name: editDoctorForm.name,
                email: editDoctorForm.email,
                phone: editDoctorForm.phone,
                gender: editDoctorForm.gender,
                dateOfBirth: editDoctorForm.dateOfBirth,
                avatarUrl,
                address: editDoctorForm.address,
                about: editingDoctor.about || '',
                specialization_id: editDoctorForm.specialization_id,
                yearsOfExperience: editDoctorForm.yearsOfExperience
            };

            const response = await doctorService.updateDoctor(doctorData);
            if (response) {
                showNotification('Cập nhật thông tin bác sĩ thành công', 'success');
                handleCloseEditDoctor();
                // Refresh danh sách bác sĩ
                const updatedDoctors = await doctorService.getDoctorsByHospital(selectedHospital?.id || 0);
                setDoctors(updatedDoctors);
            }
        } catch (error) {
            showNotification('Cập nhật thông tin bác sĩ thất bại', 'error');
            console.error('Error updating doctor:', error);
        }
    };

    const renderEditDoctorModal = () => {
        if (!showEditDoctorModal) return null;

        return (
            <div className="modal-overlay">
                <div className="modal-content doctor-modal">
                    <div className="modal-header">
                        <h3>Chỉnh Sửa Thông Tin Bác Sĩ</h3>
                        <button className="close-button" onClick={handleCloseEditDoctor}>×</button>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveDoctor(); }}>
                        {/* <div className="form-container"> */}
                        <div className="form-left">
                            <div className="image-upload-section">
                                <div className="image-preview">
                                    {editDoctorForm.avatarUrl ? (
                                        <img src={editDoctorForm.avatarUrl} alt="Preview" />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: '#f0f4ff',
                                            color: '#1a237e'
                                        }}>
                                            Chưa có ảnh
                                        </div>
                                    )}
                                </div>
                                <label htmlFor="doctorImage" className="upload-button">
                                    Chọn ảnh
                                </label>
                                <input
                                    type="file"
                                    id="doctorImage"
                                    name="doctorImage"
                                    accept="image/*"
                                    onChange={handleEditDoctorImageChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Họ và tên:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editDoctorForm.name}
                                    onChange={handleEditDoctorChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editDoctorForm.email}
                                    onChange={handleEditDoctorChange}
                                />
                            </div>
                            <div className="modal-footer" style={{ marginTop: 32 }}>
                                <button type="button" className="cancel-button" onClick={handleCloseEditDoctor}>
                                    Hủy
                                </button>
                                <button type="submit" className="save-button">
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                        <div className="form-right">

                            <div className="form-group">
                                <label>Số điện thoại:</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={editDoctorForm.phone}
                                    onChange={handleEditDoctorChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Ngày sinh:</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={editDoctorForm.dateOfBirth}
                                    onChange={handleEditDoctorChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Địa chỉ:</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={editDoctorForm.address}
                                    onChange={handleEditDoctorChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Năm kinh nghiệm:</label>
                                <input
                                    type="number"
                                    name="yearsOfExperience"
                                    value={editDoctorForm.yearsOfExperience}
                                    onChange={handleEditDoctorChange}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Chuyên khoa:</label>
                                <select
                                    name="specialization_id"
                                    value={editDoctorForm.specialization_id}
                                    onChange={handleEditDoctorChange}
                                >
                                    {specializations.map(spec => (
                                        <option key={spec.id} value={spec.id}>
                                            {spec.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Giới tính:</label>
                                <select
                                    name="gender"
                                    value={editDoctorForm.gender}
                                    onChange={handleEditDoctorChange}
                                >
                                    <option value="MALE">Nam</option>
                                    <option value="FEMALE">Nữ</option>
                                </select>
                            </div>
                        </div>
                        {/* </div> */}
                    </form>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'patients':
                const activePatients = patients.filter(patient => patient.user.enabled).length;
                const disabledPatients = patients.filter(patient => !patient.user.enabled).length;

                return (
                    <div className="admin-content">
                        <div className="content-header">
                            <h2>Quản lý bệnh nhân</h2>
                            <div className="patients-stats">
                                <div className="stat-card active">
                                    <div className="stat-icon">👥</div>
                                    <div className="stat-info">
                                        <div className="stat-label">Đang hoạt động</div>
                                        <div className="stat-value">{activePatients}</div>
                                    </div>
                                </div>
                                <div className="stat-card disabled">
                                    <div className="stat-icon">🔒</div>
                                    <div className="stat-info">
                                        <div className="stat-label">Đã khóa</div>
                                        <div className="stat-value">{disabledPatients}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="patients-search">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo email hoặc số điện thoại..."
                                    value={patientSearchTerm}
                                    onChange={(e) => setPatientSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>

                        <div className="content-body">
                            {isLoading ? (
                                <div className="loading">Đang tải...</div>
                            ) : (
                                <>
                                    <div className="patients-table-container">
                                        {filteredPatients.length === 0 ? (
                                            <div className="no-data">Không tìm thấy bệnh nhân nào</div>
                                        ) : (
                                            <>
                                                <table className="patients-table">
                                                    <thead>
                                                        <tr>
                                                            <th>ID</th>
                                                            <th>Họ và tên</th>
                                                            <th>Email</th>
                                                            <th>Số điện thoại</th>
                                                            <th>Giới tính</th>
                                                            <th>Ngày sinh</th>
                                                            <th>Địa chỉ</th>
                                                            <th>Trạng thái</th>
                                                            <th>Thao tác</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredPatients.slice(indexOfFirstItem, indexOfLastItem).map((patient) => (
                                                            <tr key={patient.id}>
                                                                <td>{patient.id}</td>
                                                                <td>{patient.user.name}</td>
                                                                <td>{patient.user.email}</td>
                                                                <td>{patient.user.phone}</td>
                                                                <td>{patient.user.gender === 'MALE' ? 'Nam' : 'Nữ'}</td>
                                                                <td>{formatDate(patient.user.dateOfBirth)}</td>
                                                                <td>{patient.user.address}</td>
                                                                <td>
                                                                    <span className={`status-badge ${patient.user.enabled ? 'active' : 'disabled'}`}>
                                                                        {patient.user.enabled ? 'Hoạt động' : 'Đã khóa'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <button
                                                                        className={`toggle-button ${patient.user.enabled ? 'disable' : 'enable'}`}
                                                                        onClick={() => handleTogglePatientStatus(parseInt(patient.id), patient.user.enabled)}
                                                                    >
                                                                        {patient.user.enabled ? 'Khóa' : 'Mở khóa'}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                {renderPagination()}
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            case 'hospitals':
                const activeHospitals = hospitals.filter(hospital => hospital.enabled).length;
                const disabledHospitals = hospitals.filter(hospital => !hospital.enabled).length;
                return (
                    <div className="admin-content">
                        <div className="content-header">
                            <div className="header-left">
                                <h2>Quản lý bệnh viện</h2>
                                <div className="patients-stats">
                                    <div className="stat-card active">
                                        <div className="stat-icon">🏥</div>
                                        <div className="stat-info">
                                            <div className="stat-label">Hoạt động</div>
                                            <div className="stat-value">{activeHospitals}</div>
                                        </div>
                                    </div>
                                    <div className="stat-card disabled">
                                        <div className="stat-icon">🔒</div>
                                        <div className="stat-info">
                                            <div className="stat-label">Đã khóa</div>
                                            <div className="stat-value">{disabledHospitals}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="patients-search">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên bệnh viện..."
                                        value={hospitalSearchTerm}
                                        onChange={(e) => setHospitalSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                            </div>
                            <button className="add-button" onClick={() => setShowHospitalModal(true)}>
                                <span className="icon">🏥</span>
                                Thêm bệnh viện
                            </button>
                        </div>
                        <div className="content-body">
                            {isLoading ? (
                                <div className="loading">Đang tải...</div>
                            ) : (
                                <div className="hospital-grid">
                                    {filteredHospitals.map((hospital) => (
                                        <div
                                            key={hospital.id}
                                            className="hospital-card"
                                            onClick={() => handleHospitalClick(hospital)}
                                        >
                                            <div className="hospital-image">
                                                <img src={hospital.avatarUrl} alt={hospital.name} />
                                            </div>
                                            <div className="hospital-info">
                                                <h3>{hospital.name}</h3>
                                                <div className="hospital-details">
                                                    <div className="hospital-contact">
                                                        <p className="hospital-address">
                                                            <span className="icon">📍</span>
                                                            {hospital.address}
                                                        </p>
                                                        <p className="hospital-phone">
                                                            <span className="icon">📞</span>
                                                            {hospital.phone}
                                                        </p>
                                                    </div>
                                                    <div className="hospital-stats">
                                                        <p className="stat-item">
                                                            <span className="icon">👨‍⚕️</span>
                                                            {hospital.doctorCount} Bác sĩ
                                                        </p>
                                                        <p className="stat-item">
                                                            <span className="icon">🏥</span>
                                                            {hospital.specializationCount} Chuyên khoa
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="hospital-actions">
                                                    <button
                                                        className="update-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenEditHospital(hospital);
                                                        }}
                                                    >
                                                        <i className="fas fa-save"></i>
                                                        Cập nhật thông tin
                                                    </button>
                                                    <button
                                                        className={`toggle-button ${hospital.enabled ? 'enabled' : ''}`}
                                                        onClick={() => handleToggleHospitalStatus(hospital)}
                                                    >
                                                        <i className={`fas ${hospital.enabled ? 'fa-lock-open' : 'fa-lock'}`}></i>
                                                        {hospital.enabled ? 'Khóa bệnh viện' : 'Mở khóa bệnh viện'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'appointments':
                return (
                    <div className="appointments-section" style={{ padding: '0px' }}>
                        <h2>Quản lý cuộc hẹn</h2>
                        <div className="appointments-filters">
                            <div className="filter-group">
                                <input
                                    type="text"
                                    name="doctor"
                                    placeholder="Tìm theo tên bác sĩ"
                                    value={appointmentFilters.doctor}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="filter-group">
                                <input
                                    type="text"
                                    name="patient"
                                    placeholder="Tìm theo tên bệnh nhân"
                                    value={appointmentFilters.patient}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="filter-group">
                                <input
                                    type="date"
                                    name="date"
                                    value={appointmentFilters.date}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="filter-group">
                                <select
                                    name="status"
                                    value={appointmentFilters.status}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="PENDING">Chờ xác nhận</option>
                                    <option value="CONFIRMED">Đã xác nhận</option>
                                    <option value="CANCELLED">Đã hủy</option>
                                    <option value="COMPLETED">Đã hoàn thành</option>
                                </select>
                            </div>
                        </div>
                        <div className="appointments-table-container">
                            <table className="appointments-table">
                                <thead>
                                    <tr>
                                        <th>Thời gian</th>
                                        <th>Bác sĩ</th>
                                        <th>Bệnh nhân</th>
                                        <th>Lý do khám</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentAppointments.map((appointment: Appointment) => (
                                        <tr key={appointment.id}>
                                            <td>{formatDateTime(appointment.appointmentDate, appointment.startTime)}</td>
                                            <td>{appointment.doctor_name}</td>
                                            <td>{appointment.patient_name}</td>
                                            <td>{appointment.description}</td>
                                            <td>
                                                <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                                                    {getStatusText(appointment.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalAppointmentPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination-button"
                                    onClick={() => handleAppointmentPageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    &laquo;
                                </button>
                                {Array.from({ length: totalAppointmentPages }, (_, i) => i + 1).map((number) => (
                                    <button
                                        key={number}
                                        className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                                        onClick={() => handleAppointmentPageChange(number)}
                                    >
                                        {number}
                                    </button>
                                ))}
                                <button
                                    className="pagination-button"
                                    onClick={() => handleAppointmentPageChange(currentPage + 1)}
                                    disabled={currentPage === totalAppointmentPages}
                                >
                                    &raquo;
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'statistics':
                const data = [
                    { name: 'Đã hoàn thành', value: appointmentStats.COMPLETED },
                    { name: 'Đã hủy', value: appointmentStats.CANCELLED }
                ];

                const COLORS = ['#4CAF50', '#f44336'];

                return (
                    <div className="admin-content">
                        <div className="statistics-filters">
                            <div className="filter-group">
                                <label>Từ ngày:</label>
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                            <div className="filter-group">
                                <label>Đến ngày:</label>
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                            </div>
                            <button
                                className="filter-button"
                                onClick={() => {
                                    if (dateRange.startDate && dateRange.endDate) {
                                        fetchAppointmentStats();
                                        fetchHospitalStats();
                                        fetchDoctorStats();
                                        fetchRevisitStats();
                                    } else {
                                        showNotification('Vui lòng chọn khoảng thời gian', 'error');
                                    }
                                }}
                            >
                                Lọc
                            </button>
                        </div>
                        <div className="statistics-container">
                            <div className="pie-chart-container">
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="revisit-stats-container">
                                <h3>Thống kê tái khám</h3>
                                <div className="revisit-stats-card">
                                    <div className="revisit-stat-info">
                                        <div className="revisit-stat-rate">{revisitStats.revisitRate}</div>
                                        <div className="revisit-stat-label">Tỉ lệ bệnh nhân tái khám trong {revisitStats.daysWindow} ngày</div>
                                    </div>
                                </div>
                            </div>
                            <div className="hospital-stats-container">
                                <h3>Thống kê theo bệnh viện</h3>
                                <div className="hospital-stats-grid">
                                    {hospitalStats.map((stat, index) => (
                                        <div key={index} className="hospital-stat-card">
                                            <div className="hospital-stat-icon">🏥</div>
                                            <div className="hospital-stat-info">
                                                <div className="hospital-stat-name">{stat.hospitalName}</div>
                                                <div className="hospital-stat-count">{stat.count} cuộc hẹn</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="hospital-stats-container">
                                <h3>Thống kê theo bác sĩ</h3>
                                <div className="hospital-stats-grid">
                                    {doctorStats.map((stat, index) => (
                                        <div key={index} className="hospital-stat-card">
                                            <div className="hospital-stat-icon">👨‍⚕️</div>
                                            <div className="hospital-stat-info">
                                                <div className="hospital-stat-name">{stat.doctorName}</div>
                                                <div className="hospital-stat-count">
                                                    <div className="stat-count-item completed">
                                                        <span>✅</span> Đã hoàn thành: {stat.completed}
                                                    </div>
                                                    <div className="stat-count-item cancelled">
                                                        <span>❌</span> Đã hủy: {stat.cancelled}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return <div className="admin-content">Quản lý bệnh nhân</div>;
        }
    };

    const renderEditHospitalModal = () => {
        if (!showEditHospitalModal || !editingHospital) return null;

        return (
            <div className="hospital-edit-modal">
                <div className="hospital-edit-content">
                    <div className="hospital-edit-header">
                        <h2>Chỉnh sửa thông tin bệnh viện</h2>
                        <button className="hospital-edit-close" onClick={handleCloseEditHospital}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="hospital-edit-body">
                        <div className="hospital-edit-form-group">
                            <label>Tên bệnh viện</label>
                            <input
                                type="text"
                                name="name"
                                value={editHospitalForm.name}
                                onChange={handleEditHospitalChange}
                                placeholder="Nhập tên bệnh viện"
                            />
                        </div>
                        <div className="hospital-edit-form-group">
                            <label>Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={editHospitalForm.address}
                                onChange={handleEditHospitalChange}
                                placeholder="Nhập địa chỉ"
                            />
                        </div>
                        <div className="hospital-edit-form-group">
                            <label>Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                value={editHospitalForm.phone}
                                onChange={handleEditHospitalChange}
                                placeholder="Nhập số điện thoại"
                            />
                        </div>
                        <div className="hospital-edit-form-group">
                            <label>Ảnh đại diện</label>
                            <div className="image-upload-container">
                                <div className="image-preview">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" />
                                    ) : editingHospital.avatarUrl ? (
                                        <img src={editingHospital.avatarUrl} alt="Current" />
                                    ) : (
                                        <div className="no-image">
                                            <i className="fas fa-image"></i>
                                            <span>Chưa có ảnh</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="file-input"
                                />
                                <button className="upload-button" onClick={() => document.querySelector('.file-input')?.click()}>
                                    <i className="fas fa-upload"></i>
                                    Chọn ảnh
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="hospital-edit-footer">
                        <button className="hospital-edit-cancel" onClick={handleCloseEditHospital}>
                            Hủy
                        </button>
                        <button className="hospital-edit-save" onClick={handleSaveHospital}>
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-page">
            {/* Top Bar */}
            <div className="top-bar">
                <div className="top-bar-content" >
                    <div className="logo" >
                        <img src={logoImage} alt="VietNam Pharma" />
                        <span style={{ color: '#fff' }}>VietNam Pharma</span>
                    </div>
                    <div className="user-greeting" style={{}}>
                        <span>Xin chào, Admin!</span>
                        <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                    </div>
                </div>
            </div>

            {/* Admin Content */}
            <div className="admin-container">
                {/* Sidebar */}
                <div className="admin-sidebar">
                    <div className="sidebar-header">
                        <h2>Quản lý hệ thống</h2>
                    </div>
                    <ul className="sidebar-menu">
                        <li>
                            <button
                                className={activeTab === 'patients' ? 'active' : ''}
                                onClick={() => setActiveTab('patients')}
                            >
                                <span className="icon">👥</span>
                                Quản lý bệnh nhân
                            </button>
                        </li>
                        <li>
                            <button
                                className={activeTab === 'hospitals' ? 'active' : ''}
                                onClick={() => setActiveTab('hospitals')}
                            >
                                <span className="icon">🏥</span>
                                Quản lý bệnh viện
                            </button>
                        </li>
                        <li>
                            <button
                                className={activeTab === 'appointments' ? 'active' : ''}
                                onClick={() => setActiveTab('appointments')}
                            >
                                <span className="icon">📅</span>
                                Quản lý cuộc hẹn
                            </button>
                        </li>
                        <li>
                            <button
                                className={activeTab === 'statistics' ? 'active' : ''}
                                onClick={() => setActiveTab('statistics')}
                            >
                                <span className="icon">📊</span>
                                Thống kê
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="admin-main">
                    {renderContent()}
                </div>
            </div>

            {/* Modal Thêm Bệnh Viện */}
            {showHospitalModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Thêm Bệnh Viện Mới</h3>
                            <button className="close-button" onClick={() => setShowHospitalModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleHospitalSubmit}>
                            <div className="form-group">
                                <label htmlFor="hospitalName">Tên bệnh viện</label>
                                <input
                                    type="text"
                                    id="hospitalName"
                                    value={hospitalForm.name}
                                    onChange={(e) => setHospitalForm(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    placeholder="Nhập tên bệnh viện"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="hospitalAddress">Địa chỉ</label>
                                <input
                                    type="text"
                                    id="hospitalAddress"
                                    value={hospitalForm.address}
                                    onChange={(e) => setHospitalForm(prev => ({ ...prev, address: e.target.value }))}
                                    required
                                    placeholder="Nhập địa chỉ bệnh viện"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="hospitalPhone">Số điện thoại</label>
                                <input
                                    type="tel"
                                    id="hospitalPhone"
                                    value={hospitalForm.phone}
                                    onChange={(e) => setHospitalForm(prev => ({ ...prev, phone: e.target.value }))}
                                    required
                                    placeholder="Nhập số điện thoại bệnh viện"
                                    pattern="[0-9]{10}"
                                    title="Vui lòng nhập số điện thoại 10 chữ số"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="hospitalImage">Ảnh bệnh viện</label>
                                <input
                                    type="file"
                                    id="hospitalImage"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    required
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-button" onClick={() => setShowHospitalModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="submit-button">
                                    Thêm bệnh viện
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Chi Tiết Bệnh Viện */}
            {showHospitalDetailModal && selectedHospital && (
                <div className="modal-overlay">
                    <div className="modal-content hospital-detail-modal">
                        <div className="modal-header">
                            <h3>Chi Tiết Bệnh Viện</h3>
                            <button className="close-button" onClick={() => setShowHospitalDetailModal(false)}>×</button>
                        </div>
                        <div className="hospital-detail-content">
                            <div className="hospital-detail-main">
                                <div className="hospital-detail-header">
                                    <img src={selectedHospital.avatarUrl} alt={selectedHospital.name} />
                                    <div className="hospital-detail-info">
                                        <h2>{selectedHospital.name}</h2>
                                        <p><span className="icon">📍</span> {selectedHospital.address}</p>
                                        <p><span className="icon">📞</span> {selectedHospital.phone}</p>
                                    </div>
                                </div>

                                <div className="specializations-section">
                                    <div className="section-header">
                                        <h3>Danh Sách Chuyên Khoa</h3>
                                        <div className="header-actions">
                                            <div className="search-box">
                                                <input
                                                    type="text"
                                                    placeholder="Tìm kiếm chuyên khoa..."
                                                    value={searchTerm}
                                                    onChange={handleSearch}
                                                />
                                                <span className="search-icon">🔍</span>
                                            </div>
                                            <button
                                                className="add-button"
                                                onClick={() => setShowAddSpecializationModal(true)}
                                            >
                                                <span className="icon">➕</span>
                                                Thêm Chuyên Khoa
                                            </button>
                                        </div>
                                    </div>
                                    <div className="specializations-list">
                                        {filteredSpecializations && filteredSpecializations.length > 0 ? (
                                            <table className="specialization-table">
                                                <thead>
                                                    <tr>
                                                        <th>STT</th>
                                                        <th>Tên Chuyên Khoa</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredSpecializations.map((spec, index) => (
                                                        <tr key={spec.id}>
                                                            <td>{index + 1}</td>
                                                            <td>{spec.name}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="no-data">Chưa có chuyên khoa nào</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="doctors-section">
                                <div className="section-header">
                                    <h3>Danh Sách Bác Sĩ</h3>
                                    <div className="header-actions">
                                        <div className="search-box">
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm bác sĩ..."
                                                value={doctorSearchTerm}
                                                onChange={handleDoctorSearch}
                                            />
                                            <span className="search-icon">🔍</span>
                                        </div>
                                        <select
                                            className="specialization-filter"
                                            value={selectedSpecialization}
                                            onChange={handleSpecializationFilter}
                                        >
                                            <option value="">Tất cả chuyên khoa</option>
                                            {specializations.map(spec => (
                                                <option key={spec.id} value={spec.name}>
                                                    {spec.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            className="add-button"
                                            onClick={() => setShowAddDoctorModal(true)}
                                        >
                                            <span className="icon">➕</span>
                                            Thêm Bác Sĩ
                                        </button>
                                    </div>
                                </div>
                                <div className="doctors-list">
                                    {filteredDoctors && filteredDoctors.length > 0 ? (
                                        <table className="specialization-table" >
                                            <thead>
                                                <tr>
                                                    <th>STT</th>
                                                    <th>Họ và tên</th>
                                                    <th>Giới tính</th>
                                                    <th>Ngày sinh</th>
                                                    <th>Chuyên khoa</th>
                                                    <th>Năm kinh nghiệm</th>
                                                    <th>Email</th>
                                                    <th>Số điện thoại</th>
                                                    <th>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredDoctors.map((doctor, index) => (
                                                    <tr key={doctor.id}>
                                                        <td>{index + 1}</td>
                                                        <td>{doctor.name}</td>
                                                        <td>{doctor.gender}</td>
                                                        <td>{doctor.dateOfBirth}</td>
                                                        <td>{doctor.specialization_name}</td>
                                                        <td>{doctor.yearsOfExperience}</td>
                                                        <td>{doctor.email}</td>
                                                        <td>{doctor.phone}</td>
                                                        <td>
                                                            <button
                                                                className="edit-button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenEditDoctor(doctor);
                                                                }}
                                                            >
                                                                Sửa
                                                            </button>
                                                            <button
                                                                className={doctor.enabled ? 'lock-button' : 'unlock-button'}
                                                                onClick={() => handleToggleDoctorStatus(doctor)}
                                                            >
                                                                {doctor.enabled ? 'Khóa' : 'Mở khóa'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="no-data">Chưa có bác sĩ nào</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Thêm Chuyên Khoa */}
            {showAddSpecializationModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Thêm Chuyên Khoa Mới</h3>
                            <button className="close-button" onClick={handleCloseSpecializationModal}>×</button>
                        </div>
                        <form onSubmit={handleAddSpecialization}>
                            <div className="form-group">
                                <label htmlFor="specializationName">Tên chuyên khoa</label>
                                <input
                                    type="text"
                                    id="specializationName"
                                    value={specializationForm.name}
                                    onChange={(e) => setSpecializationForm(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    placeholder="Nhập tên chuyên khoa"
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-button" onClick={handleCloseSpecializationModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="submit-button">
                                    Thêm chuyên khoa
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Thêm Bác Sĩ */}
            {showAddDoctorModal && (
                <div className="modal-overlay">
                    <div className="modal-content doctor-modal">
                        <div className="modal-header">
                            <h3>Thêm Bác Sĩ Mới</h3>
                            <button className="close-button" onClick={() => setShowAddDoctorModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddDoctor}>
                            <div className="form-left">
                                <div className="image-upload-section">
                                    <div className="image-preview">
                                        {previewImage ? (
                                            <img src={previewImage} alt="Preview" />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: '#f0f4ff',
                                                color: '#1a237e'
                                            }}>
                                                Chưa có ảnh
                                            </div>
                                        )}
                                    </div>
                                    <label htmlFor="doctorImage" className="upload-button">
                                        Chọn ảnh
                                    </label>
                                    <input
                                        type="file"
                                        id="doctorImage"
                                        name="doctorImage"
                                        accept="image/*"
                                        onChange={handleDoctorImageChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorExperience">Năm kinh nghiệm</label>
                                    <input
                                        type="number"
                                        id="doctorExperience"
                                        value={doctorForm.experience}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, experience: e.target.value }))}
                                        required
                                        placeholder="Nhập số năm kinh nghiệm"
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorSpecialization">Chuyên ngành</label>
                                    <select
                                        id="doctorSpecialization"
                                        value={doctorForm.specialization}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, specialization: e.target.value }))}
                                        required
                                    >
                                        <option value="">Chọn chuyên ngành</option>
                                        {specializations.map(spec => (
                                            <option key={spec.id} value={spec.id}>{spec.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorGender">Giới tính</label>
                                    <select
                                        id="doctorGender"
                                        value={doctorForm.gender}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, gender: e.target.value }))}
                                        required
                                    >
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                    </select>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="cancel-button" onClick={() => setShowAddDoctorModal(false)}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="submit-button">
                                        Thêm bác sĩ
                                    </button>
                                </div>
                            </div>
                            <div className="form-right">
                                <div className="form-group">
                                    <label htmlFor="doctorName">Họ và tên</label>
                                    <input
                                        type="text"
                                        id="doctorName"
                                        value={doctorForm.name}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                        placeholder="Nhập họ và tên bác sĩ"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorEmail">Email</label>
                                    <input
                                        type="email"
                                        id="doctorEmail"
                                        value={doctorForm.email}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                        placeholder="Nhập email bác sĩ"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorPassword">Mật khẩu</label>
                                    <input
                                        type="password"
                                        id="doctorPassword"
                                        value={doctorForm.password}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, password: e.target.value }))}
                                        required
                                        placeholder="Nhập mật khẩu"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorPhone">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        id="doctorPhone"
                                        value={doctorForm.phone}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, phone: e.target.value }))}
                                        required
                                        placeholder="Nhập số điện thoại"
                                        pattern="[0-9]{10}"
                                        title="Vui lòng nhập số điện thoại 10 chữ số"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorDateOfBirth">Ngày sinh</label>
                                    <input
                                        type="date"
                                        id="doctorDateOfBirth"
                                        value={doctorForm.dateOfBirth}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorAddress">Địa chỉ</label>
                                    <input
                                        type="text"
                                        id="doctorAddress"
                                        value={doctorForm.address}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, address: e.target.value }))}
                                        required
                                        placeholder="Nhập địa chỉ"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorAbout">Giới thiệu</label>
                                    <textarea
                                        id="doctorAbout"
                                        value={doctorForm.about}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, about: e.target.value }))}
                                        required
                                        placeholder="Nhập giới thiệu về bác sĩ"
                                        rows={4}
                                    />
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {showDoctorActionModal && renderDoctorActionModal()}

            {renderEditHospitalModal()}

            {renderEditDoctorModal()}

            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default Admin; 