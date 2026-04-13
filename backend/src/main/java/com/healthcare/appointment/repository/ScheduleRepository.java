package com.healthcare.appointment.repository;

import com.healthcare.appointment.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    /**
     * Find all schedules for a specific doctor
     */
    List<Schedule> findByDoctor_DoctorIdOrderByStartTimeAsc(Long doctorId);

    /**
     * Find only available (unbooked) schedules for a specific doctor from a given date onward
     */
    @Query("SELECT s FROM Schedule s WHERE s.doctor.doctorId = :doctorId AND s.isBooked = false AND s.startTime >= :fromDate ORDER BY s.startTime ASC")
    List<Schedule> findAvailableSchedulesByDoctorIdFromDate(@Param("doctorId") Long doctorId, @Param("fromDate") LocalDateTime fromDate);

    /**
     * Find all available (unbooked) schedules for a specific doctor
     */
    List<Schedule> findByDoctor_DoctorIdAndIsBookedFalseOrderByStartTimeAsc(Long doctorId);

    /**
     * Check for overlapping schedules for a specific doctor
     */
    @Query("SELECT COUNT(s) FROM Schedule s WHERE s.doctor.doctorId = :doctorId AND " +
           "((s.startTime < :endTime AND s.endTime > :startTime)) AND s.scheduleId != :excludeScheduleId")
    long countOverlappingSchedules(@Param("doctorId") Long doctorId,
                                  @Param("startTime") LocalDateTime startTime,
                                  @Param("endTime") LocalDateTime endTime,
                                  @Param("excludeScheduleId") Long excludeScheduleId);
}
