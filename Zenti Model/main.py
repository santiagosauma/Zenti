import time
import pprint
import cv2
import mediapipe as mp
import numpy as np
import csv
from attention_scorer import AttentionScorer as AttScorer
from eye_detector import EyeDetector as EyeDet
from parser import get_args
from pose_estimation import HeadPoseEstimator as HeadPoseEst
from utils import get_landmarks, load_camera_parameters

def draw_text_with_background(frame, text, position, font, font_scale, text_color, bg_color, thickness=1):
    (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, thickness)
    x, y = position
    cv2.rectangle(frame, (x, y - text_height - baseline), (x + text_width, y + baseline), bg_color, cv2.FILLED)
    cv2.putText(frame, text, (x, y), font, font_scale, text_color, thickness, cv2.LINE_AA)

def main():
    args = get_args()

    if not cv2.useOptimized():
        try:
            cv2.setUseOptimized(True)
        except:
            print("OpenCV optimization could not be set to True, the script may be slower than expected")

    if args.camera_params:
        camera_matrix, dist_coeffs = load_camera_parameters(args.camera_params)
    else:
        camera_matrix, dist_coeffs = None, None

    if args.verbose:
        print("Arguments and Parameters used:\n")
        pprint.pp(vars(args), indent=4)
        print("\nCamera Matrix:")
        pprint.pp(camera_matrix, indent=4)
        print("\nDistortion Coefficients:")
        pprint.pp(dist_coeffs, indent=4)
        print("\n")

    Detector = mp.solutions.face_mesh.FaceMesh(
        static_image_mode=False,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
        refine_landmarks=True,
    )

    Eye_det = EyeDet(show_processing=args.show_eye_proc)
    Head_pose = HeadPoseEst(show_axis=args.show_axis, camera_matrix=camera_matrix, dist_coeffs=dist_coeffs)

    prev_time = time.perf_counter()
    fps = 0.0

    t_now = time.perf_counter()

    Scorer = AttScorer(
        t_now=t_now,
        ear_thresh=args.ear_thresh,
        gaze_time_thresh=args.gaze_time_thresh,
        roll_thresh=args.roll_thresh,
        pitch_thresh=args.pitch_thresh,
        yaw_thresh=args.yaw_thresh,
        ear_time_thresh=args.ear_time_thresh,
        gaze_thresh=args.gaze_thresh,
        pose_time_thresh=args.pose_time_thresh,
        verbose=args.verbose,
    )

    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        print("Cannot open camera")
        exit()

    # Diccionario para almacenar los tiempos de las alertas
    alert_times = {
        "tired": 0,
        "asleep": 0,
        "looking_away": 0,
        "distracted": 0
    }
    cooldown_period = 2  # Duración del cooldown en segundos

    # Abrir archivo CSV para guardar los datos
    with open('alert_data.csv', mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["timestamp", "ear", "gaze", "roll", "pitch", "yaw", "tired", "asleep", "looking_away", "distracted"])

        while True:
            t_now = time.perf_counter()
            elapsed_time = t_now - prev_time
            prev_time = t_now

            if elapsed_time > 0:
                fps = np.round(1 / elapsed_time, 3)

            ret, frame = cap.read()
            if not ret:
                print("Can't receive frame from camera/stream end")
                break

            if args.camera == 0:
                frame = cv2.flip(frame, 2)

            e1 = cv2.getTickCount()
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            frame_size = frame.shape[1], frame.shape[0]
            gray = np.expand_dims(gray, axis=2)
            gray = np.concatenate([gray, gray, gray], axis=2)

            lms = Detector.process(gray).multi_face_landmarks

            if lms:
                landmarks = get_landmarks(lms)
                Eye_det.show_eye_keypoints(color_frame=frame, landmarks=landmarks, frame_size=frame_size)
                ear = Eye_det.get_EAR(frame=gray, landmarks=landmarks)
                tired, perclos_score = Scorer.get_PERCLOS(t_now, fps, ear)
                gaze = Eye_det.get_Gaze_Score(frame=gray, landmarks=landmarks, frame_size=frame_size)
                frame_det, roll, pitch, yaw = Head_pose.get_pose(frame=frame, landmarks=landmarks, frame_size=frame_size)
                asleep, looking_away, distracted = Scorer.eval_scores(
                    t_now=t_now,
                    ear_score=ear,
                    gaze_score=gaze,
                    head_roll=roll,
                    head_pitch=pitch,
                    head_yaw=yaw,
                )

                if frame_det is not None:
                    frame = frame_det

                if ear is not None:
                    draw_text_with_background(frame, f"EAR: {round(ear, 3)}", (10, 50), cv2.FONT_HERSHEY_PLAIN, 2, (255, 255, 255), (0, 0, 0))

                if gaze is not None:
                    draw_text_with_background(frame, f"Gaze Score: {round(gaze, 3)}", (10, 80), cv2.FONT_HERSHEY_PLAIN, 2, (255, 255, 255), (0, 0, 0))

                draw_text_with_background(frame, f"PERCLOS: {round(perclos_score, 3)}", (10, 110), cv2.FONT_HERSHEY_PLAIN, 2, (255, 255, 255), (0, 0, 0))

                if roll is not None:
                    draw_text_with_background(frame, f"roll: {roll.round(1)[0]}", (450, 40), cv2.FONT_HERSHEY_PLAIN, 1.5, (255, 0, 255), (0, 0, 0))
                if pitch is not None:
                    draw_text_with_background(frame, f"pitch: {pitch.round(1)[0]}", (450, 70), cv2.FONT_HERSHEY_PLAIN, 1.5, (255, 0, 255), (0, 0, 0))
                if yaw is not None:
                    draw_text_with_background(frame, f"yaw: {yaw.round(1)[0]}", (450, 100), cv2.FONT_HERSHEY_PLAIN, 1.5, (255, 0, 255), (0, 0, 0))

                # Actualizar los tiempos de las alertas
                if tired:
                    alert_times["tired"] = t_now
                if asleep:
                    alert_times["asleep"] = t_now
                if looking_away:
                    alert_times["looking_away"] = t_now
                if distracted:
                    alert_times["distracted"] = t_now

                # Guardar los datos en el archivo CSV
                writer.writerow([t_now, ear, gaze, roll[0], pitch[0], yaw[0], int(tired), int(asleep), int(looking_away), int(distracted)])

            # Mostrar las alertas si están dentro del período de cooldown
            if t_now - alert_times["tired"] < cooldown_period:
                draw_text_with_background(frame, "TIRED!", (10, 280), cv2.FONT_HERSHEY_PLAIN, 1, (0, 0, 255), (0, 0, 0))
            if t_now - alert_times["asleep"] < cooldown_period:
                draw_text_with_background(frame, "ASLEEP!", (10, 300), cv2.FONT_HERSHEY_PLAIN, 1, (0, 0, 255), (0, 0, 0))
            if t_now - alert_times["looking_away"] < cooldown_period:
                draw_text_with_background(frame, "LOOKING AWAY!", (10, 320), cv2.FONT_HERSHEY_PLAIN, 1, (0, 0, 255), (0, 0, 0))
            if t_now - alert_times["distracted"] < cooldown_period:
                draw_text_with_background(frame, "DISTRACTED!", (10, 340), cv2.FONT_HERSHEY_PLAIN, 1, (0, 0, 255), (0, 0, 0))

            e2 = cv2.getTickCount()
            proc_time_frame_ms = ((e2 - e1) / cv2.getTickFrequency()) * 1000

            if args.show_fps:
                draw_text_with_background(frame, f"FPS: {round(fps)}", (10, 400), cv2.FONT_HERSHEY_PLAIN, 2, (255, 0, 255), (0, 0, 0))
            if args.show_proc_time:
                draw_text_with_background(frame, f"PROC. TIME FRAME: {round(proc_time_frame_ms, 0)}ms", (10, 430), cv2.FONT_HERSHEY_PLAIN, 2, (255, 0, 255), (0, 0, 0))

            cv2.imshow("Press 'q' to terminate", frame)

            if cv2.waitKey(20) & 0xFF == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()