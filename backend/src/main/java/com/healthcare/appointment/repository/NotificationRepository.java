package com.healthcare.appointment.repository;

import com.healthcare.appointment.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Find all notifications for a specific user, ordered by timestamp descending
     */
    List<Notification> findByUser_UserIdOrderByTimestampDesc(Long userId);
}
