
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Form data to be sent
    let formData = {
        name: contactForm['name'].value,
        email: contactForm['email'].value,
        message: contactForm['message'].value
    };

    // Here you would typically send the formData to the server
    // For demonstration, we'll just log it to the console
    console.log(formData);

    // Reset the form after submission
    contactForm.reset();

    // Optionally, show a success message or handle the response
});
