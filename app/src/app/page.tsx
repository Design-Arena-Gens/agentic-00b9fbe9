"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";
import { initialSnapshot } from "@/lib/mockData";
import {
  ChildProfile,
  DonorProfile,
  ParentProfile,
  TherapyGoal,
  TherapySession,
  TherapistProfile,
  TherapyStatus,
} from "@/lib/types";

type RoleKey = "center" | "therapist" | "parent" | "donor";

const roleOptions: { key: RoleKey; label: string }[] = [
  { key: "center", label: "Therapy Center" },
  { key: "therapist", label: "Therapist" },
  { key: "parent", label: "Parent" },
  { key: "donor", label: "Donor" },
];

const goalStatusLabels: Record<TherapyStatus, string> = {
  on_track: "On Track",
  needs_support: "Needs Support",
  at_risk: "At Risk",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const createClientId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

interface FamilyUpdate {
  id: string;
  message: string;
  date: string;
}

function RoleSelector({
  selectedRole,
  onSelect,
}: {
  selectedRole: RoleKey;
  onSelect: (role: RoleKey) => void;
}) {
  return (
    <div className={styles.roleSelector}>
      {roleOptions.map((option) => (
        <button
          key={option.key}
          className={
            option.key === selectedRole
              ? `${styles.roleButton} ${styles.activeRole}`
              : styles.roleButton
          }
          type="button"
          onClick={() => onSelect(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className={styles.metricCard}>
      <span className={styles.metricLabel}>{title}</span>
      <span className={styles.metricValue}>{value}</span>
      <p className={styles.metricDetail}>{detail}</p>
    </div>
  );
}

function GoalProgressBar({ goal }: { goal: TherapyGoal }) {
  const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const statusClass =
    goal.status === "on_track"
      ? styles.goalOnTrack
      : goal.status === "needs_support"
        ? styles.goalNeedsSupport
        : styles.goalAtRisk;

  return (
    <div className={styles.goalItem}>
      <div className={styles.goalHeader}>
        <span className={styles.goalCategory}>{goal.category}</span>
        <span className={`${styles.goalStatus} ${statusClass}`}>
          {goalStatusLabels[goal.status]}
        </span>
      </div>
      <p className={styles.goalDescription}>{goal.description}</p>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressValue}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className={styles.goalFooter}>
        <span>Baseline {goal.baseline}%</span>
        <span>Current {goal.current}%</span>
        <span>Target {goal.target}%</span>
      </div>
    </div>
  );
}

function SessionItem({
  session,
  therapist,
}: {
  session: TherapySession;
  therapist: TherapistProfile | undefined;
}) {
  return (
    <div className={styles.sessionItem}>
      <div className={styles.sessionHeader}>
        <span className={styles.sessionDate}>{formatDate(session.date)}</span>
        {therapist ? (
          <span className={styles.sessionTherapist}>{therapist.name}</span>
        ) : null}
      </div>
      <p className={styles.sessionFocus}>{session.focus}</p>
      <div className={styles.sessionFooter}>
        <span className={styles.sessionBadge}>
          Progress score {session.rating}/5
        </span>
        <div className={styles.sessionGoals}>
          {session.goalsWorkedOn.map((goalId) => (
            <span key={goalId} className={styles.sessionGoal}>
              {goalId.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
      <p className={styles.sessionNotes}>{session.notes}</p>
    </div>
  );
}

function UpcomingSessionCard({
  date,
  focus,
  location,
  therapist,
}: {
  date: string;
  focus: string;
  location: string;
  therapist: TherapistProfile | undefined;
}) {
  return (
    <div className={styles.upcomingItem}>
      <div>
        <span className={styles.upcomingDate}>{formatDateTime(date)}</span>
        <p className={styles.upcomingFocus}>{focus}</p>
      </div>
      <div className={styles.upcomingFooter}>
        <span>{location}</span>
        {therapist ? <span>{therapist.name}</span> : null}
      </div>
    </div>
  );
}

function ChildBadge({
  child,
  isActive,
  onSelect,
}: {
  child: ChildProfile;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        isActive
          ? `${styles.childBadge} ${styles.childBadgeActive}`
          : styles.childBadge
      }
    >
      <span
        className={styles.childAvatar}
        style={{ backgroundColor: child.avatarColor }}
      >
        {child.name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </span>
      <div className={styles.childSummary}>
        <span className={styles.childName}>{child.name}</span>
        <span className={styles.childMeta}>
          {child.age} yrs · {child.diagnosis}
        </span>
      </div>
    </button>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className={styles.emptyState}>{label}</div>;
}

export default function Home() {
  const [children, setChildren] = useState(initialSnapshot.children);
  const [selectedRole, setSelectedRole] = useState<RoleKey>("center");
  const [selectedTherapistId, setSelectedTherapistId] = useState(
    initialSnapshot.therapists[0]?.id ?? "",
  );
  const [selectedParentId, setSelectedParentId] = useState(
    initialSnapshot.parents[0]?.id ?? "",
  );
  const [selectedDonorId, setSelectedDonorId] = useState(
    initialSnapshot.donors[0]?.id ?? "",
  );
  const [selectedChildId, setSelectedChildId] = useState(
    initialSnapshot.children[0]?.id ?? "",
  );
  const [familyUpdates, setFamilyUpdates] = useState<
    Record<string, FamilyUpdate[]>
  >({});

  const therapists = initialSnapshot.therapists;
  const parents = initialSnapshot.parents;
  const donors = initialSnapshot.donors;
  const highlights = initialSnapshot.highlights;

  const findFirstExistingChildId = (ids: string[]) =>
    ids.find((childId) => children.some((child) => child.id === childId));

  const ensureChildSelection = (candidateId: string | undefined) =>
    candidateId && children.some((child) => child.id === candidateId)
      ? candidateId
      : children[0]?.id ?? "";

  const handleRoleSelect = (role: RoleKey) => {
    setSelectedRole(role);

    if (role === "therapist") {
      const fallbackTherapist =
        therapists.find((profile) => profile.id === selectedTherapistId) ??
        therapists[0];
      if (fallbackTherapist) {
        const childId = findFirstExistingChildId(fallbackTherapist.childIds);
        setSelectedTherapistId(fallbackTherapist.id);
        setSelectedChildId(ensureChildSelection(childId));
      }
      return;
    }

    if (role === "parent") {
      const fallbackParent =
        parents.find((profile) => profile.id === selectedParentId) ?? parents[0];
      if (fallbackParent) {
        const childId = findFirstExistingChildId(fallbackParent.childIds);
        setSelectedParentId(fallbackParent.id);
        setSelectedChildId(ensureChildSelection(childId));
      }
      return;
    }

    if (role === "donor") {
      const fallbackDonor =
        donors.find((profile) => profile.id === selectedDonorId) ?? donors[0];
      if (fallbackDonor) {
        const childId = findFirstExistingChildId(fallbackDonor.childIds);
        setSelectedDonorId(fallbackDonor.id);
        setSelectedChildId(ensureChildSelection(childId));
      }
      return;
    }

    setSelectedChildId((current) => ensureChildSelection(current));
  };

  const handleTherapistChange = (id: string) => {
    setSelectedTherapistId(id);
    const therapist = therapists.find((profile) => profile.id === id);
    if (therapist) {
      const childId = findFirstExistingChildId(therapist.childIds);
      setSelectedChildId(ensureChildSelection(childId));
    }
  };

  const handleParentChange = (id: string) => {
    setSelectedParentId(id);
    const parent = parents.find((profile) => profile.id === id);
    if (parent) {
      const childId = findFirstExistingChildId(parent.childIds);
      setSelectedChildId(ensureChildSelection(childId));
    }
  };

  const handleDonorChange = (id: string) => {
    setSelectedDonorId(id);
    const donor = donors.find((profile) => profile.id === id);
    if (donor) {
      const childId = findFirstExistingChildId(donor.childIds);
      setSelectedChildId(ensureChildSelection(childId));
    }
  };

  const selectedChild = children.find((child) => child.id === selectedChildId);
  const selectedTherapist = therapists.find(
    (profile) => profile.id === selectedTherapistId,
  );
  const selectedParent = parents.find((profile) => profile.id === selectedParentId);
  const selectedDonor = donors.find((profile) => profile.id === selectedDonorId);

  const filteredChildren = useMemo(() => {
    switch (selectedRole) {
      case "therapist":
        return children.filter((child) =>
          child.therapists.includes(selectedTherapistId),
        );
      case "parent":
        return children.filter((child) =>
          selectedParent?.childIds.includes(child.id),
        );
      case "donor":
        return children.filter((child) =>
          selectedDonor?.childIds.includes(child.id),
        );
      default:
        return children;
    }
  }, [children, selectedRole, selectedTherapistId, selectedParent, selectedDonor]);

  const resolvedChild =
    selectedChild ?? filteredChildren[0] ?? children[0] ?? null;

  const thisWeekSessions = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return children
      .flatMap((child) => child.sessionHistory)
      .filter((session) => new Date(session.date) >= weekAgo).length;
  }, [children]);

  const averageGoalProgress = useMemo(() => {
    const goals = children.flatMap((child) => child.therapyGoals);
    if (!goals.length) {
      return 0;
    }
    const total = goals.reduce((sum, goal) => sum + goal.current, 0);
    return Math.round(total / goals.length);
  }, [children]);

  const atRiskGoals = useMemo(
    () =>
      children
        .flatMap((child) => child.therapyGoals)
        .filter((goal) => goal.status !== "on_track").length,
    [children],
  );

  const upcomingSessions = useMemo(
    () => children.flatMap((child) => child.upcomingSessions),
    [children],
  );

  const handleAddFamilyUpdate = (childId: string, message: string) => {
    if (!message.trim()) {
      return;
    }
    const newEntry: FamilyUpdate = {
      id: createClientId(),
      message: message.trim(),
      date: new Date().toISOString(),
    };
    setFamilyUpdates((prev) => {
      const existing = prev[childId] ?? [];
      return {
        ...prev,
        [childId]: [newEntry, ...existing],
      };
    });
  };

  const updateGoalStatus = (goal: TherapyGoal): TherapyGoal => {
    const ratio = goal.current / goal.target;
    let status: TherapyStatus = "at_risk";
    if (ratio >= 0.8) {
      status = "on_track";
    } else if (ratio >= 0.55) {
      status = "needs_support";
    }
    return { ...goal, status };
  };

  const handleAddSession = ({
    childId,
    focus,
    notes,
    rating,
    date,
    goalIds,
    therapistId,
  }: {
    childId: string;
    focus: string;
    notes: string;
    rating: number;
    date: string;
    goalIds: string[];
    therapistId: string;
  }) => {
    if (!focus.trim()) {
      return;
    }
    const session: TherapySession = {
      id: createClientId(),
      date,
      focus: focus.trim(),
      goalsWorkedOn: goalIds,
      rating,
      notes: notes.trim() || "No additional notes recorded.",
      therapistId,
    };

    setChildren((prev) =>
      prev.map((child) => {
        if (child.id !== childId) {
          return child;
        }

        const updatedGoals = child.therapyGoals.map((goal) => {
          if (!goalIds.includes(goal.id)) {
            return goal;
          }
          const increment = Math.round((rating / 5) * 8);
          const nextCurrent = Math.min(goal.target, goal.current + increment);
          return updateGoalStatus({ ...goal, current: nextCurrent });
        });

        return {
          ...child,
          therapyGoals: updatedGoals,
          sessionHistory: [session, ...child.sessionHistory],
        };
      }),
    );
  };

  const roleHeader =
    selectedRole === "center"
      ? "Therapy Center Command"
      : selectedRole === "therapist"
        ? "Therapist Workspace"
        : selectedRole === "parent"
          ? "Family View"
          : "Donor Impact Studio";

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div>
          <span className={styles.appBadge}>ThriveCare</span>
          <h1 className={styles.title}>{roleHeader}</h1>
          <p className={styles.subtitle}>
            Monitor progress, celebrate wins, and keep every therapy partner aligned
            in one place.
          </p>
        </div>
      </header>

      <RoleSelector selectedRole={selectedRole} onSelect={handleRoleSelect} />

      <section className={styles.metricRow}>
        <MetricCard
          title="Active Children"
          value={`${children.length}`}
          detail="Children receiving therapy support this month."
        />
        <MetricCard
          title="Average Goal Progress"
          value={`${averageGoalProgress}%`}
          detail="Across all active therapy goals."
        />
        <MetricCard
          title="Sessions This Week"
          value={`${thisWeekSessions}`}
          detail="Direct therapy sessions completed in the past 7 days."
        />
        <MetricCard
          title="Goals Needing Support"
          value={`${atRiskGoals}`}
          detail="Goals flagged as needs support or at risk."
        />
      </section>

      <section className={styles.selectorPanel}>
        <div className={styles.selectorGroup}>
          <span className={styles.selectorLabel}>Focus on child</span>
          <div className={styles.childScroller}>
            {filteredChildren.map((child) => (
              <ChildBadge
                key={child.id}
                child={child}
                isActive={child.id === selectedChildId}
                onSelect={() => setSelectedChildId(child.id)}
              />
            ))}
            {!filteredChildren.length ? (
              <EmptyState label="No children assigned here yet." />
            ) : null}
          </div>
        </div>

        {selectedRole === "therapist" ? (
          <div className={styles.selectorGroup}>
            <span className={styles.selectorLabel}>Therapist</span>
            <select
              className={styles.selectorControl}
              value={selectedTherapistId}
              onChange={(event) => handleTherapistChange(event.target.value)}
            >
              {therapists.map((therapist) => (
                <option key={therapist.id} value={therapist.id}>
                  {therapist.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {selectedRole === "parent" ? (
          <div className={styles.selectorGroup}>
            <span className={styles.selectorLabel}>Parent</span>
            <select
              className={styles.selectorControl}
              value={selectedParentId}
              onChange={(event) => handleParentChange(event.target.value)}
            >
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {selectedRole === "donor" ? (
          <div className={styles.selectorGroup}>
            <span className={styles.selectorLabel}>Donor</span>
            <select
              className={styles.selectorControl}
              value={selectedDonorId}
              onChange={(event) => handleDonorChange(event.target.value)}
            >
              {donors.map((donor) => (
                <option key={donor.id} value={donor.id}>
                  {donor.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Therapy Goals</h2>
          {resolvedChild ? (
            <div className={styles.goalList}>
              {resolvedChild.therapyGoals.map((goal) => (
                <GoalProgressBar key={goal.id} goal={goal} />
              ))}
            </div>
          ) : (
            <EmptyState label="Select a child to review therapy goals." />
          )}
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Recent Sessions</h2>
          {resolvedChild && resolvedChild.sessionHistory.length ? (
            <div className={styles.sessionList}>
              {resolvedChild.sessionHistory.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  therapist={therapists.find(
                    (therapist) => therapist.id === session.therapistId,
                  )}
                />
              ))}
            </div>
          ) : (
            <EmptyState label="Session history will appear here once logged." />
          )}
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Upcoming Sessions</h2>
          {resolvedChild && resolvedChild.upcomingSessions.length ? (
            <div className={styles.upcomingList}>
              {resolvedChild.upcomingSessions.map((session) => (
                <UpcomingSessionCard
                  key={session.id}
                  date={session.date}
                  focus={session.focus}
                  location={session.location}
                  therapist={therapists.find(
                    (therapist) => therapist.id === session.therapistId,
                  )}
                />
              ))}
            </div>
          ) : (
            <EmptyState label="No sessions scheduled yet." />
          )}
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {selectedRole === "therapist"
              ? "Log New Session"
              : selectedRole === "parent"
                ? "Family Notes"
                : selectedRole === "donor"
                  ? "Donor Spotlight"
                  : "Impact Highlights"}
          </h2>

          {selectedRole === "therapist" && selectedTherapist && resolvedChild ? (
            <TherapistLogForm
              key={resolvedChild.id}
              child={resolvedChild}
              therapist={selectedTherapist}
              onSubmit={handleAddSession}
            />
          ) : null}

          {selectedRole === "parent" && resolvedChild && selectedParent ? (
            <ParentUpdatePanel
              key={resolvedChild.id}
              child={resolvedChild}
              parent={selectedParent}
              updates={familyUpdates[resolvedChild.id] ?? []}
              onSubmit={handleAddFamilyUpdate}
            />
          ) : null}

          {selectedRole === "donor" && selectedDonor ? (
            <DonorImpactPanel donor={selectedDonor} childProfiles={children} />
          ) : null}

          {selectedRole === "center" ? (
            <div className={styles.highlightList}>
              {highlights.map((highlight) => (
                <div key={highlight.id} className={styles.highlightCard}>
                  <span className={styles.highlightMetric}>{highlight.metric}</span>
                  <h3 className={styles.highlightTitle}>{highlight.title}</h3>
                  <p className={styles.highlightDescription}>
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Team Directory</h2>
          <div className={styles.directorySection}>
            <div className={styles.directoryColumn}>
              <h3 className={styles.directoryTitle}>Therapists</h3>
              {therapists.map((profile) => (
                <div key={profile.id} className={styles.directoryItem}>
                  <div>
                    <span className={styles.directoryName}>{profile.name}</span>
                    <span className={styles.directoryMeta}>{profile.title}</span>
                  </div>
                  <span className={styles.directoryMeta}>
                    {profile.childIds.length} children
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.directoryColumn}>
              <h3 className={styles.directoryTitle}>Parents</h3>
              {parents.map((profile) => (
                <div key={profile.id} className={styles.directoryItem}>
                  <div>
                    <span className={styles.directoryName}>{profile.name}</span>
                    <span className={styles.directoryMeta}>
                      {profile.childIds.length} child
                      {profile.childIds.length === 1 ? "" : "ren"}
                    </span>
                  </div>
                  <span className={styles.directoryMeta}>{profile.contact}</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className={styles.allSessionsPanel}>
        <h2 className={styles.panelTitle}>Agency Wide Schedule</h2>
        <div className={styles.scheduleScroller}>
          {upcomingSessions.length ? (
            upcomingSessions.map((session) => {
              const child = children.find((item) => item.id === session.childId);
              const therapist = therapists.find(
                (item) => item.id === session.therapistId,
              );
              return (
                <div key={session.id} className={styles.scheduleCard}>
                  <span className={styles.scheduleDate}>
                    {formatDateTime(session.date)}
                  </span>
                  <h3 className={styles.scheduleFocus}>{session.focus}</h3>
                  <p className={styles.scheduleMeta}>
                    {child?.name ?? "Child"} · {therapist?.name ?? "Therapist"}
                  </p>
                  <span className={styles.scheduleLocation}>{session.location}</span>
                </div>
              );
            })
          ) : (
            <EmptyState label="Schedule upcoming sessions to populate this view." />
          )}
        </div>
      </section>
    </div>
  );
}

function TherapistLogForm({
  child,
  therapist,
  onSubmit,
}: {
  child: ChildProfile;
  therapist: TherapistProfile;
  onSubmit: (payload: {
    childId: string;
    focus: string;
    notes: string;
    rating: number;
    date: string;
    goalIds: string[];
    therapistId: string;
  }) => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [focus, setFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(3);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>(() =>
    child.therapyGoals.slice(0, 2).map((goal) => goal.id),
  );

  const toggleGoal = (goalId: string) => {
    setSelectedGoalIds((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId],
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedGoalIds.length) {
      return;
    }
    onSubmit({
      childId: child.id,
      focus,
      notes,
      rating,
      date,
      goalIds: selectedGoalIds,
      therapistId: therapist.id,
    });
    setFocus("");
    setNotes("");
  };

  return (
    <form className={styles.therapistForm} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="session-date">Session date</label>
        <input
          id="session-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="session-focus">Area of focus</label>
        <input
          id="session-focus"
          type="text"
          value={focus}
          onChange={(event) => setFocus(event.target.value)}
          placeholder="E.g. Pragmatic language group activity"
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>Goals addressed</label>
        <div className={styles.goalPicker}>
          {child.therapyGoals.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggleGoal(goal.id)}
              className={
                selectedGoalIds.includes(goal.id)
                  ? `${styles.goalChip} ${styles.goalChipActive}`
                  : styles.goalChip
              }
            >
              {goal.category}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="session-rating">Progress score</label>
        <input
          id="session-rating"
          type="range"
          min={1}
          max={5}
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
        />
        <span className={styles.ratingValue}>{rating}/5</span>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="session-notes">Session notes</label>
        <textarea
          id="session-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Key observations, home carryover ideas..."
          rows={3}
        />
      </div>
      <button type="submit" className={styles.submitButton}>
        Save Session for {child.name}
      </button>
      <p className={styles.helperText}>
        Logged by {therapist.name}. Session will appear instantly on family and
        center views.
      </p>
    </form>
  );
}

function ParentUpdatePanel({
  child,
  parent,
  updates,
  onSubmit,
}: {
  child: ChildProfile;
  parent: ParentProfile;
  updates: FamilyUpdate[];
  onSubmit: (childId: string, message: string) => void;
}) {
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(child.id, message);
    setMessage("");
  };

  return (
    <div className={styles.parentPanel}>
      <div className={styles.parentHeader}>
        <span className={styles.parentName}>{parent.name}</span>
        <span className={styles.parentContact}>{parent.contact}</span>
      </div>
      <form onSubmit={handleSubmit} className={styles.parentForm}>
        <label htmlFor="family-update">Share home observations</label>
        <textarea
          id="family-update"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          placeholder="How did the home practice go this week?"
          required
        />
        <button type="submit" className={styles.submitButton}>
          Send update to care team
        </button>
      </form>
      <div className={styles.parentUpdates}>
        {updates.length ? (
          updates.map((update) => (
            <div key={update.id} className={styles.parentUpdateItem}>
              <span className={styles.parentUpdateDate}>
                {formatDate(update.date)}
              </span>
              <p>{update.message}</p>
            </div>
          ))
        ) : (
          <EmptyState label="Share a note to keep your care team in the loop." />
        )}
      </div>
    </div>
  );
}

function DonorImpactPanel({
  donor,
  childProfiles,
}: {
  donor: DonorProfile;
  childProfiles: ChildProfile[];
}) {
  const supportedChildren = childProfiles.filter((child) =>
    donor.childIds.includes(child.id),
  );

  const averageProgress = supportedChildren.length
    ? Math.round(
        supportedChildren.reduce((sum, child) => {
          const progress =
            child.therapyGoals.reduce((gSum, goal) => gSum + goal.current, 0) /
            child.therapyGoals.length;
          return sum + progress;
        }, 0) / supportedChildren.length,
      )
    : 0;

  return (
    <div className={styles.donorPanel}>
      <div className={styles.donorSummary}>
        <h3>{donor.name}</h3>
        <span className={styles.donorContribution}>
          ${donor.contribution.toLocaleString()}
        </span>
        <p>Supporting {supportedChildren.length} children.</p>
        <span className={styles.donorMeta}>
          Last update {formatDate(donor.lastUpdate)}
        </span>
      </div>
      <div className={styles.donorHighlights}>
        <div className={styles.donorHighlight}>
          <span className={styles.donorHighlightValue}>{averageProgress}%</span>
          <p>Average progress across sponsored goals.</p>
        </div>
        <div className={styles.donorHighlight}>
          <span className={styles.donorHighlightValue}>
            {donor.missions.length}
          </span>
          <p>Core missions funded this quarter.</p>
        </div>
      </div>
      <div className={styles.donorChildren}>
        {supportedChildren.map((child) => (
          <div key={child.id} className={styles.donorChildCard}>
            <div className={styles.donorChildHeader}>
              <span
                className={styles.childAvatar}
                style={{ backgroundColor: child.avatarColor }}
              >
                {child.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <div>
                <span className={styles.childName}>{child.name}</span>
                <span className={styles.childMeta}>{child.diagnosis}</span>
              </div>
            </div>
            <p className={styles.donorChildSummary}>
              {child.therapyGoals
                .slice(0, 2)
                .map(
                  (goal) =>
                    `${goal.category}: ${Math.round((goal.current / goal.target) * 100)}%`,
                )
                .join(" • ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
