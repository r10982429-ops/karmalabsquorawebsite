const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

if (menuBtn && navMenu) {
  menuBtn.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });

  navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => navMenu.classList.remove("open"));
  });
}

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("visible"));
}

const form = document.getElementById("leadForm");
const submitBtn = document.getElementById("submitBtn");
const formStatus = document.getElementById("formStatus");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "SENDING...";
    formStatus.textContent = "Sending your enquiry...";

    const formData = new FormData(form);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      website: formData.get("website"),
      service: formData.get("service"),
      goal: formData.get("goal"),
      message: formData.get("message"),
      company: formData.get("company")
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Unable to send enquiry.");
      }

      form.reset();
      submitBtn.textContent = "ENQUIRY SENT ✓";
      formStatus.textContent = "Thanks! Your enquiry has been sent to Karma Labs.";

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "REQUEST MY QUORA PLAN →";
      }, 3000);

    } catch (error) {
      console.error(error);
      submitBtn.disabled = false;
      submitBtn.textContent = "REQUEST MY QUORA PLAN →";
      formStatus.textContent = error.message || "Unable to send right now. Please try again.";
    }
  });
}
