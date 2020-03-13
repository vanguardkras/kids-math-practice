<?php

if (isset($_POST['solved_tasks']) && isset($_POST['operator_name'])) {
    extract($_POST);

    $data = json_decode(file_get_contents('sasha.json'), true);

    $level = 'level_' . $operator_name;
    $data[$level]++;
    $data['level_total']++;
    $data['total_solved_tasks'] += intval($solved_tasks);

    file_put_contents('sasha.json', json_encode($data));
}